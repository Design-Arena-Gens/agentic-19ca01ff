import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interpretation, setInterpretation] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)

          if (finalTranscript) {
            processVoiceInput(finalTranscript.trim())
          }
        }

        recognitionRef.current.onerror = (event) => {
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      } else {
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setError('')
      setTranscript('')
      setInterpretation('')
      setSearchResults([])
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const processVoiceInput = async (text) => {
    setIsProcessing(true)

    // Interpret the voice input
    const interpreted = interpretQuery(text)
    setInterpretation(interpreted.interpretation)

    // Simulate search results based on interpretation
    const results = await performSearch(interpreted.searchQuery)
    setSearchResults(results)

    setIsProcessing(false)
  }

  const interpretQuery = (text) => {
    const lowerText = text.toLowerCase()

    // Detect intent and extract key information
    let interpretation = ''
    let searchQuery = text

    if (lowerText.includes('find') || lowerText.includes('search for') || lowerText.includes('look for')) {
      interpretation = 'Searching for: '
      searchQuery = text.replace(/find|search for|look for|please|can you/gi, '').trim()
    } else if (lowerText.includes('what is') || lowerText.includes('who is') || lowerText.includes('where is')) {
      interpretation = 'Information query: '
      searchQuery = text
    } else if (lowerText.includes('how to')) {
      interpretation = 'Tutorial search: '
      searchQuery = text
    } else if (lowerText.includes('weather')) {
      interpretation = 'Weather information for: '
      searchQuery = text.replace(/weather|in|for/gi, '').trim()
    } else if (lowerText.includes('news')) {
      interpretation = 'Latest news about: '
      searchQuery = text.replace(/news|about/gi, '').trim()
    } else {
      interpretation = 'General search: '
    }

    return {
      interpretation: interpretation + searchQuery,
      searchQuery: searchQuery
    }
  }

  const performSearch = async (query) => {
    // Simulate AI-powered search results
    await new Promise(resolve => setTimeout(resolve, 800))

    const mockResults = [
      {
        title: `${query} - Complete Guide`,
        url: `https://example.com/${query.replace(/\s+/g, '-').toLowerCase()}`,
        snippet: `Everything you need to know about ${query}. Comprehensive information and latest updates...`
      },
      {
        title: `Top 10 ${query} Resources`,
        url: `https://example.com/top-${query.replace(/\s+/g, '-').toLowerCase()}`,
        snippet: `Discover the best resources and information about ${query}. Expert recommendations and guides...`
      },
      {
        title: `${query} - Latest News and Updates`,
        url: `https://news.example.com/${query.replace(/\s+/g, '-').toLowerCase()}`,
        snippet: `Stay updated with the latest developments regarding ${query}. Breaking news and analysis...`
      },
      {
        title: `Understanding ${query}`,
        url: `https://learn.example.com/${query.replace(/\s+/g, '-').toLowerCase()}`,
        snippet: `Learn everything about ${query} with our comprehensive tutorials and expert insights...`
      },
      {
        title: `${query} Community Forum`,
        url: `https://forum.example.com/${query.replace(/\s+/g, '-').toLowerCase()}`,
        snippet: `Join the discussion about ${query}. Connect with experts and enthusiasts from around the world...`
      }
    ]

    return mockResults
  }

  return (
    <>
      <Head>
        <title>Voice-Enabled Search</title>
        <meta name="description" content="Search the web using your voice with AI interpretation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header className="header">
          <h1>🎤 Voice-Enabled Search</h1>
          <p className="subtitle">Speak naturally, search intelligently</p>
        </header>

        <main className="main">
          <div className="search-section">
            <button
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              <span className="mic-icon">{isListening ? '🔴' : '🎤'}</span>
              <span className="mic-text">
                {isListening ? 'Listening...' : 'Click to Speak'}
              </span>
            </button>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {transcript && (
              <div className="transcript-box">
                <h3>You said:</h3>
                <p className="transcript">{transcript}</p>
              </div>
            )}

            {interpretation && (
              <div className="interpretation-box">
                <h3>AI Interpretation:</h3>
                <p className="interpretation">{interpretation}</p>
              </div>
            )}

            {isProcessing && (
              <div className="processing">
                <div className="spinner"></div>
                <p>Processing your request...</p>
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="results-section">
              <h2>Search Results</h2>
              <div className="results-list">
                {searchResults.map((result, index) => (
                  <div key={index} className="result-item">
                    <h3 className="result-title">
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </h3>
                    <p className="result-url">{result.url}</p>
                    <p className="result-snippet">{result.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tips-section">
            <h3>💡 Try saying:</h3>
            <ul className="tips-list">
              <li>"Search for JavaScript tutorials"</li>
              <li>"What is artificial intelligence?"</li>
              <li>"Find the latest news about technology"</li>
              <li>"How to learn React"</li>
              <li>"Weather in New York"</li>
            </ul>
          </div>
        </main>

        <footer className="footer">
          <p>Built with Web Speech API and AI Text Interpretation</p>
        </footer>
      </div>
    </>
  )
}
