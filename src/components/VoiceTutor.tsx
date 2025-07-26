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
    // This is a mock implementation - replace with actual OpenAI API call
    const responses = {
      chat: [
        `That's a great question! Let me help you with that.`,
        `I understand. Can you tell me more about that?`,
        `Excellent! You're doing really well. What else would you like to know?`,
        `That's interesting! Can you give me an example?`
      ],
      roleplay: {
        school: [
          `Nice to meet you! Do you like school?`,
          `That's wonderful! What's your favorite subject?`,
          `Great! Do you have many friends at school?`
        ],
        store: [
          `That's a good choice! How many would you like?`,
          `Perfect! That costs $2. Do you have money?`,
          `Thank you for shopping with us! Have a great day!`
        ],
        home: [
          `That sounds lovely! Do you help your family at home?`,
          `What a nice family! What do you like to do together?`,
          `That's wonderful! You're very helpful!`
        ]
      }
    };

    // Simple response selection logic
    if (mode === 'chat') {
      return responses.chat[Math.floor(Math.random() * responses.chat.length)];
    } else if (mode === 'roleplay' && scenario) {
      const scenarioResponses = responses.roleplay[scenario as keyof typeof responses.roleplay];
      return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
    }
    
    return "That's great! Keep practicing!";
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