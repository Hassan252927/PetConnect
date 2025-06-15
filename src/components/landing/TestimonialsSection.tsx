import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestimonialsSection: React.FC = () => {
  const navigate = useNavigate();
  
  const testimonials = [
    {
      quote: "PetConnect has been a game-changer for me and my dog Max. I've connected with other dog owners in my area and even found a reliable pet sitter through the community!",
      name: "Sarah Johnson",
      title: "Dog Owner",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    },
    {
      quote: "As a veterinarian, I recommend PetConnect to all my clients. The health tracking features help pet owners stay on top of vaccinations and medications.",
      name: "Dr. Michael Chen",
      title: "Veterinarian",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    },
    {
      quote: "I love the pet community I've found here! My cats have their own followers now, and the AI assistant has helped me with so many cat behavior questions.",
      name: "Emily Rodriguez",
      title: "Cat Enthusiast",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of happy pet owners who have found their community on PetConnect.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-primary"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <div className="text-gray-700 italic relative">
                <svg className="absolute -top-2 -left-2 w-8 h-8 text-primary opacity-20" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-2.2 0-4 1.8-4 4v10h10V12h-6c0-3.3 2.7-6 6-6V2c-5.5 0-10 4.5-10 10zm12-6v4c3.3 0 6 2.7 6 6h-6v10h10V12c0-5.5-4.5-10-10-10z"/>
                </svg>
                <p className="relative z-10 pl-3">{testimonial.quote}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Join Our Community
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 