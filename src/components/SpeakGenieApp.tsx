import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Home, ShoppingCart, GraduationCap, Sparkles } from 'lucide-react';
import { VoiceTutor } from './VoiceTutor';

type AppMode = 'menu' | 'chat' | 'roleplay';
type RoleplayScenario = 'school' | 'store' | 'home';

export const SpeakGenieApp: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('menu');
  const [scenario, setScenario] = useState<RoleplayScenario>('school');

  const roleplayScenarios = [
    {
      id: 'school' as const,
      title: 'At School',
      description: 'Practice conversations about school life, subjects, and friends',
      icon: GraduationCap,
      color: 'text-blue-500'
    },
    {
      id: 'store' as const,
      title: 'At the Store',
      description: 'Learn shopping vocabulary and customer interactions',
      icon: ShoppingCart,
      color: 'text-green-500'
    },
    {
      id: 'home' as const,
      title: 'At Home',
      description: 'Talk about family, home activities, and daily routines',
      icon: Home,
      color: 'text-orange-500'
    }
  ];

  if (mode === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setMode('menu')}
              className="mb-4"
            >
              ← Back to Menu
            </Button>
          </div>
          <VoiceTutor mode="chat" />
        </div>
      </div>
    );
  }

  if (mode === 'roleplay') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setMode('menu')}
              className="mb-4"
            >
              ← Back to Menu
            </Button>
          </div>
          <VoiceTutor mode="roleplay" scenario={scenario} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-primary rounded-full p-4 shadow-glow">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            SpeakGenie
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your AI-powered English speaking tutor for children aged 6-16. 
            Practice conversations, learn through roleplay, and build confidence!
          </p>
        </div>
      </div>

      {/* Main Menu */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Chat Mode */}
          <Card className="group hover:shadow-magical transition-all duration-300 cursor-pointer transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-primary rounded-full p-3 group-hover:animate-bounce-gentle">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Free Chat with Genie</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Have a natural conversation with your AI tutor. Ask questions, 
                practice pronunciation, and get instant feedback!
              </p>
              <Button 
                variant="magical" 
                size="lg" 
                onClick={() => setMode('chat')}
                className="w-full"
              >
                Start Chatting
              </Button>
            </CardContent>
          </Card>

          {/* Roleplay Mode */}
          <Card className="group hover:shadow-magical transition-all duration-300 cursor-pointer transform hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-secondary rounded-full p-3 group-hover:animate-bounce-gentle">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Interactive Roleplay</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Practice real-life conversations through guided scenarios. 
                Build confidence in everyday situations!
              </p>
              
              {/* Scenario Selection */}
              <div className="space-y-3">
                {roleplayScenarios.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={scenario === item.id ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        setScenario(item.id);
                        setMode('roleplay');
                      }}
                      className="w-full justify-start gap-3"
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <div className="text-left">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm opacity-70">{item.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose SpeakGenie?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-6 shadow-card">
              <div className="bg-gradient-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="font-semibold mb-2">Voice Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Advanced speech recognition understands your pronunciation and provides real-time feedback
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-card">
              <div className="bg-gradient-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Age-Appropriate</h3>
              <p className="text-sm text-muted-foreground">
                Content designed specifically for children aged 6-16 with engaging, safe interactions
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-card">
              <div className="bg-gradient-hero rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold mb-2">Multi-Language</h3>
              <p className="text-sm text-muted-foreground">
                Support for native language playback in Hindi, Tamil, Marathi, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};