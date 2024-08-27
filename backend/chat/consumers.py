import json
from openai import AsyncOpenAI
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, Notification
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.call_id = self.scope['url_route']['kwargs'].get('call_id')

        if self.user_id:
            self.group_name = f'user_{self.user_id}'
        elif self.call_id:
            self.group_name = f'call_{self.call_id}'
        else:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'chat_message':
            await self.handle_chat_message(text_data_json)
        elif message_type == 'call_status_update':
            await self.handle_call_status_update(text_data_json)

    async def handle_chat_message(self, text_data_json):
        message_data = text_data_json['message']
        message_content = message_data['content']
        sender_id = message_data['sender']
        receiver_id = message_data['receiver']

        is_appropriate, ai_response = await self.moderate_message(message_content)

        if is_appropriate:
            message = await self.save_message(sender_id, receiver_id, message_content)
            notification_content = f"New message from {message.sender.first_name}"
            await self.create_notification(receiver_id, notification_content)

            await self.channel_layer.group_send(
                f'user_{sender_id}',
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender': message.sender.id,
                        'receiver': message.receiver.id,
                        'timestamp': message.timestamp.isoformat(),
                    }
                }
            )

            await self.channel_layer.group_send(
                f'user_{receiver_id}',
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender': message.sender.id,
                        'receiver': message.receiver.id,
                        'timestamp': message.timestamp.isoformat(),
                    }
                }
            )

            await self.channel_layer.group_send(
                f'user_{receiver_id}',
                {
                    'type': 'new_notification',
                    'notification': {
                        'content': notification_content,
                    }
                }
            )
        else:
            await self.send(text_data=json.dumps({
                'type': 'ai_moderation',
                'message': ai_response,
                'sender': 'AI Moderator'
            }))

    async def handle_call_status_update(self, text_data_json):
        message = text_data_json['message']
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'call_status_update',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def call_status_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'call_status_update',
            'message': message
        }))

    async def new_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))

    async def send_notification(self, event):
        notification = event['notification']
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': {
                'id': notification['id'],
                'content': notification['content'],
                'created_at': notification['created_at'].isoformat(),
            }
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        return ChatMessage.objects.create(sender=sender, receiver=receiver, content=content)

    async def moderate_message(self, message):
        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI moderator for a mental health support chat."},
                    {"role": "user", "content": f"Analyze the following message for negativity and inappropriate content: '{message}'\nIs this message appropriate for a mental health support chat? Respond with 'Yes' or 'No' followed by a brief explanation."}
                ],
                max_tokens=100
            )
            
            ai_response = response.choices[0].message.content.strip()
            is_appropriate = ai_response.lower().startswith('yes')
            
            return is_appropriate, ai_response
        except Exception as e:
            print(f"Error in AI moderation: {type(e).__name__}: {str(e)}")
            return self.fallback_moderation(message)

    def fallback_moderation(self, message):
        inappropriate_keywords = ['suicide', 'kill', 'die', 'hurt', 'abuse', 'attack']
        
        if any(keyword in message.lower() for keyword in inappropriate_keywords):
            return False, "This message may contain sensitive content. Please be mindful of the community guidelines."
        
        return True, "Message allowed (fallback moderation)"

    @database_sync_to_async
    def create_notification(self, user_id, content):
        user = User.objects.get(id=user_id)
        return Notification.objects.create(user=user, content=content)