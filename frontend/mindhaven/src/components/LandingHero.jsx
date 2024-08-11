import React from 'react';
import { ArrowRight } from 'lucide-react';
import ServiceCard from './ServiceCard';
import MentorImage from '../assets/Mentor_svg.svg'
import BuddieImage from '../assets/Buddies_svg.svg'
import DonateImage from '../assets/Donate_svg.svg'
import MindfulImage from '../assets/Mindful_svg.svg'

const MindHavenLanding = () => {
  return (
    <div className="bg-gray-30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-start mb-12 lg:mb-20">
          {/* Left side */}
          <div className="w-full lg:w-1/3 mb-8 lg:mb-0 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-custom-text mb-4">
              Give the care your mind deserves
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              Money will no longer be an issue to access the support you need.
            </p>
            <button className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-full font-semibold flex items-center justify-center mx-auto lg:mx-0 hover:bg-yellow-500 transition duration-300">
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-2/3 lg:pl-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ServiceCard
                title="Free Consultations"
                description="Get daily thirty minutes free consultations with all Professionals 24x7"
                imageUrl={MentorImage}
                titleColor="text-custom-accent"
                accentColor="bg-yellow-400"
              />
              <ServiceCard
                title="Connect with Buddies"
                description="Talk and Listen without revealing your Identity"
                footer="Find Happiness"
                imageUrl={BuddieImage}
                titleColor="text-custom-accent"
                accentColor="bg-yellow-400"
              />
              <ServiceCard
                title="Donate today"
                description="Help us provide free mental health consultations. Your donation can bring light to someone's darkest days."
                imageUrl={DonateImage}
                titleColor="text-custom-accent"
                accentColor="bg-yellow-400"
              />
              <ServiceCard
                title="Mindful and Stress free"
                description="Follow the daily activities to be mindful"
                imageUrl={MindfulImage}
                titleColor="text-custom-accent"
                accentColor="bg-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MindHavenLanding;