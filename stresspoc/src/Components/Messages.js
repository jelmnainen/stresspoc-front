import React from 'react'
import Alert from 'react-bootstrap/Alert'

import '../utils.css'

const Messages = ({ messages }) => {
    return(messages.map((msg, idx) => {
      return(
        <Alert className="alert-float" variant="info" key={`alert-${idx}`}>
          { msg }
        </Alert>
      )
    })
  )
}

export default Messages
