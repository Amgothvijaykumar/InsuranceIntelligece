import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PolicyCard from "@/components/insurance/policy-card";
import { Shield, Car, Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (user) {
      navigate("/assessment");
    } else {
      navigate("/auth");
    }
  };

  const insuranceCategories = [
    {
      title: "Health Insurance",
      description: "Comprehensive health coverage for individuals and families, including preventive care and emergency services.",
      icon: <Heart className="h-6 w-6 text-primary" />,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Vehicle Insurance",
      description: "Protection for your vehicles with coverage options including third-party liability, comprehensive, and collision.",
      icon: <Car className="h-6 w-6 text-primary" />,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Life Term Insurance",
      description: "Financial security for your loved ones with term life insurance options customized to your needs.",
      icon: <Shield className="h-6 w-6 text-primary" />,
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Health Insurance Customer",
      initials: "RK",
      quote: "The AI recommendation system helped me find the perfect government health scheme that I wasn't even aware of. Saved me thousands in premiums!",
      rating: 5
    },
    {
      name: "Sunita Patel",
      role: "Life Insurance Customer",
      initials: "SP",
      quote: "The system quickly identified me as eligible for special government schemes based on my profile. The process was seamless and the recommendations were spot-on.",
      rating: 5
    },
    {
      name: "Mohan Reddy",
      role: "Vehicle Insurance Customer",
      initials: "MR",
      quote: "After being identified as a 'prominent customer,' I received specialized attention and recommendations that perfectly matched my needs. Great service!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Smart insurance with</span>
                  <span className="block text-primary xl:inline"> AI-powered insights</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Unlock personalized insurance recommendations and government policy matches with our advanced AI technology. We analyze your profile to find the perfect coverage.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      onClick={handleGetStarted}
                      className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      variant="secondary"
                      className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10"
                    >
                      Learn more
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Insurance professionals working" 
          />
        </div>
      </div>

      {/* Insurance Categories Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Insurance Categories</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Choose the right coverage
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Explore our range of insurance policies designed to protect what matters most to you.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {insuranceCategories.map((category, index) => (
                <PolicyCard
                  key={index}
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  imageUrl={category.image}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Feature Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">AI-Powered</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Smart recommendations for your needs
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our deep learning model analyzes your profile to identify the best government policies for your situation.
            </p>
          </div>

          <div className="mt-10">
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Discover Your Insurance Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Answer a few questions to get personalized recommendations.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center">
                  <svg className="h-24 w-24 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleGetStarted}
                    className="inline-flex items-center px-6 py-3"
                  >
                    Start Assessment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What our customers say
            </p>
          </div>

          <div className="mt-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                      {testimonial.initials}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-4 flex text-amber-500">
                    {Array(testimonial.rating).fill(0).map((_, i) => (
                      <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
