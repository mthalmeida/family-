import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

export function ButlerAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const showWelcomeMessage = async () => {
      // Adiciona mensagem de digitação
      const typingMessage: Message = {
        id: Date.now().toString(),
        text: '...',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true,
      };
      setMessages([typingMessage]);

      // Aguarda 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Substitui a mensagem de digitação pela mensagem de boas-vindas
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `🎩 Olá, família! Estou pronto para ajudar com compras, finanças e organização do lar.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    };

    showWelcomeMessage();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // TODO: Implementar integração com Dialogflow
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Esta é uma resposta temporária. A integração com o Dialogflow será implementada em breve.',
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        height: '82vh',
        width: '360px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          p: 2,
          mb: 10,
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
          height: '1000vh',
        }}
      >
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor:
                    message.sender === 'user'
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                  color:
                    message.sender === 'user'
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                }}
              >
                <ListItemText
                  primary={
                    message.isTyping ? (
                      <Typography
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            animation: 'typing 1s infinite',
                            '@keyframes typing': {
                              '0%': { opacity: 0.3 },
                              '50%': { opacity: 1 },
                              '100%': { opacity: 0.3 }
                            }
                          }}
                        >
                          ...
                        </Box>
                      </Typography>
                    ) : (
                      <Typography component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.text}
                      </Typography>
                    )
                  }
                  secondary={message.timestamp.toLocaleTimeString()}
                  secondaryTypographyProps={{
                    sx: {
                      color: message.sender === 'user'
                        ? alpha(theme.palette.primary.contrastText, 0.7)
                        : theme.palette.text.secondary,
                    },
                  }}
                />
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          position: 'fixed',
          bottom: 70,
          left: 0,
          right: 0,
          zIndex: 1,
          mx: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}