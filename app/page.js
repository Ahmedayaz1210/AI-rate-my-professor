// eslint-disable react/jsx-no-duplicate-props 


'use client'
import { Box, Button, Stack, TextField, Typography, AppBar, Toolbar } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor chatbot. How can I help you find information about professors or courses today?`,
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) return

    setMessage('')
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1]
        const otherMessages = prevMessages.slice(0, -1)
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
      })
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#4a4a4a' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            Rate My Professor Chatbot
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          py: 3,
        }}
      >
        <Stack
          direction={'column'}
          sx={{
            width: '90%',
            maxWidth: '600px',
            height: '80vh',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: message.role === 'assistant' ? '#e0e0e0' : '#1E3A8A',
                    color: message.role === 'assistant' ? 'black' : 'white',
                    borderRadius: 2,
                    p: 2,
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Stack direction={'row'} spacing={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about a professor or course..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            
              multiline
              maxRows={4}
  
            />
            <Button sx={{ backgroundColor: '#4a4a4a', color: 'white' }} onClick={sendMessage}>
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}