import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Play, Pause, MessageCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// TypeScript declarations for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInterface {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new() => SpeechRecognitionInterface;
    webkitSpeechRecognition?: new() => SpeechRecognitionInterface;
  }
}

interface VoiceTutorProps {
  mode: 'chat' | 'roleplay';
  scenario?: string;
}

export const VoiceTutor: React.FC<VoiceTutorProps> = ({ mode, scenario }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognition = useRef<any>(null);
  const synthesis = useRef<SpeechSynthesis>(window.speechSynthesis);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserInput(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or check your microphone.",
          variant: "destructive"
        });
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Initialize conversation based on mode
  useEffect(() => {
    if (mode === 'roleplay' && scenario) {
      const welcomeMessage = getRoleplayWelcome(scenario);
      setConversation([{ role: 'ai', text: welcomeMessage }]);
      speakText(welcomeMessage);
    } else if (mode === 'chat') {
      const welcomeMessage = "Hello! I'm Genie, your English tutor. What would you like to learn today?";
      setConversation([{ role: 'ai', text: welcomeMessage }]);
      speakText(welcomeMessage);
    }
  }, [mode, scenario]);

  const getRoleplayWelcome = (scenario: string): string => {
    const scenarios = {
      school: "Good morning! Welcome to school! What's your name?",
      store: "Welcome to our store! What would you like to buy today?",
      home: "Hi there! Tell me about your family. Who do you live with?"
    };
    return scenarios[scenario as keyof typeof scenarios] || "Hello! Let's practice speaking together!";
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const handleUserInput = async (text: string) => {
    setConversation(prev => [...prev, { role: 'user', text }]);
    setIsProcessing(true);

    try {
      // Simulate AI response (replace with actual OpenAI API call)
      const aiResponse = await generateAIResponse(text, mode, scenario);
      setConversation(prev => [...prev, { role: 'ai', text: aiResponse }]);
      speakText(aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (userText: string, mode: string, scenario?: string): Promise<string> => {
    const apiKey = localStorage.getItem('openai_api_key') || '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';
    
    let systemPrompt = '';
    
    if (mode === 'chat') {
      systemPrompt = `You are Genie, a friendly English tutor for children aged 6-16. 
      Keep responses simple, encouraging, and age-appropriate. 
      Use examples they can relate to. Keep responses under 50 words.
      Be patient and helpful in explaining English concepts.`;
    } else if (mode === 'roleplay') {
      const scenarioPrompts = {
        school: `You are playing the role of a school friend or teacher. Keep the conversation natural and school-related. Ask about subjects, friends, activities. Keep responses under 30 words.`,
        store: `You are a shopkeeper. Help the student practice buying things. Ask about quantities, prices, and be friendly. Keep responses under 30 words.`,
        home: `You are a family member or friend visiting. Ask about family, home activities, and daily life. Keep responses under 30 words.`
      };
      systemPrompt = scenarioPrompts[scenario as keyof typeof scenarioPrompts] || 'Have a friendly conversation and keep responses short.';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I didn't understand that. Can you try again?";
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to simple response
      return mode === 'chat' 
        ? "That's interesting! Can you tell me more?" 
        : "That's great! What else would you like to talk about?";
    }
  };

  const speakText = (text: string) => {
    if (synthesis.current) {
      synthesis.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesis.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis.current) {
      synthesis.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          {mode === 'chat' ? <MessageCircle className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          {mode === 'chat' ? 'Chat with Genie' : `Roleplay: ${scenario}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conversation Display */}
        <div className="bg-muted rounded-lg p-4 h-64 overflow-y-auto space-y-3">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground shadow-sm'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-card text-card-foreground px-4 py-2 rounded-lg shadow-sm animate-pulse">
                Genie is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant={isListening ? "destructive" : "voice"}
            size="icon-lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking || isProcessing}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>

          <Button
            variant={isSpeaking ? "destructive" : "secondary"}
            size="icon-lg"
            onClick={isSpeaking ? stopSpeaking : () => {}}
            disabled={!isSpeaking}
          >
            {isSpeaking ? <Pause className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="text-center space-y-2">
          {isListening && (
            <p className="text-primary font-medium animate-pulse">🎤 Listening...</p>
          )}
          {isSpeaking && (
            <p className="text-secondary font-medium animate-speaking">🗣️ Speaking...</p>
          )}
          {isProcessing && (
            <p className="text-accent font-medium">🤔 Processing...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};