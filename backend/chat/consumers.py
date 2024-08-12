import json
from openai import AsyncOpenAI
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage,Notification
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()
# Initialize the AsyncOpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class ChatConsumer(AsyncWebsocketConsumer):
 
 #created for celery notification
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
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'

        # Join user group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'chat_message':
            message_data = text_data_json['message']
            message_content = message_data['content']
            sender_id = message_data['sender']
            receiver_id = message_data['receiver']

            # AI moderation
            is_appropriate, ai_response = await self.moderate_message(message_content)

            if is_appropriate:
                # Save message to database
                message = await self.save_message(sender_id, receiver_id, message_content)

                # Create notification for the receiver
                notification_content = f"New message from {message.sender.first_name}"
                await self.create_notification(receiver_id, notification_content)

                # Send message to sender's group
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

                # Send message to receiver's group
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
                # Send notification to receiver's group
                await self.channel_layer.group_send(
                    f'user_{receiver_id}',
                    {
                        'type': 'new_notification',
                        'notification': {
                            'content': notification_content,
                        }
                    }
                )

                # Send AI response to the sender
            else:
                # Send AI response to the sender
                await self.send(text_data=json.dumps({
                    'type': 'ai_moderation',
                    'message': ai_response,
                    'sender': 'AI Moderator'
                }))

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
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
        # List of keywords that might indicate inappropriate content
        inappropriate_keywords = ['suicide', 'kill', 'die', 'hurt', 'abuse', 'attack']
        
        # Check if any inappropriate keywords are in the message
        if any(keyword in message.lower() for keyword in inappropriate_keywords):
            return False, "This message may contain sensitive content. Please be mindful of the community guidelines."
        
        return True, "Message allowed (fallback moderation)"
    
# notification create
    async def new_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))

    @database_sync_to_async
    def create_notification(self, user_id, content):
        user = User.objects.get(id=user_id)
        return Notification.objects.create(user=user, content=content)