import { useRef, useCallback, useEffect } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 120, maxHeight }) {
  const editorRef = useRef(null)
  const isInternalChange = useRef(false)

  // Set initial HTML only when value changes externally
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const execCmd = useCallback((cmd) => {
    document.execCommand(cmd, false, null)
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', '&:focus-within': { borderColor: '#1976d2', boxShadow: '0 0 0 1px #1976d2' } }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 0.5, px: 1, py: 0.5, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
        <Tooltip title="Negrita (Ctrl+B)">
          <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); execCmd('bold') }}>
            <FormatBoldIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cursiva (Ctrl+I)">
          <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); execCmd('italic') }}>
            <FormatItalicIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editable area */}
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        sx={{
          minHeight,
          maxHeight: maxHeight || 'none',
          overflowY: maxHeight ? 'auto' : 'visible',
          px: 1.5,
          py: 1,
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: '#374151',
          outline: 'none',
          '&:empty::before': {
            content: `"${placeholder || 'Escribe aquí...'}"`,
            color: '#9ca3af',
          },
          '& b, & strong': { fontWeight: 700 },
          '& i, & em': { fontStyle: 'italic' },
        }}
      />
    </Box>
  )
}
