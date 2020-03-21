import React, { useReducer, useEffect } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { adjust, map, pipe, assoc, append, drop, cond, prop, equals, range, findIndex, pick } from 'ramda'
import axios from '../axios'
import { GooSpinner } from 'react-spinners-kit'

import Messages from '../Components/Messages'
import './answer.css'
import '../utils.css'

const questionInitialState = {
  fetching: false,
  questions: [],
  messages: []
}

const questionReducer = (state, { type, payload }) => {
  console.log(type, payload)
  switch(type) {
    case 'questions/ASK_FOR_QUESTIONS':
      return assoc('fetching', true, state)
    case 'questions/SERVER_RESPONDED_WITH_QUESTIONS':
      return pipe(
        assoc('fetching', false),
        assoc('questions', payload)
      )(state)
    case 'questions/ERROR_FETCHING_QUESTIONS':
      return pipe(
        assoc('fetching', false),
        assoc('messages', append(payload.error, state.messages))
      )(state)
    case 'questions/SELECT_ANSWER':
      const { id, newAnswer } = payload
      const updateIdx = findIndex((q) => equals(prop('id', q), id), prop('questions', state))
      const newQuestions = adjust(updateIdx, assoc('answer', newAnswer), prop('questions', state))
      return assoc('questions', newQuestions, state)
    case 'questions/CLEAR_OLDEST_MESSAGE':
      return assoc('messages', drop(1, state.messages), state)
    case 'questions/SUBMIT_ANSWERS':
      return assoc('fetching', true, state)
    case 'questions/SUBMIT_ANSWERS_SUCCESSFUL':
      return pipe(
        assoc('fetching', false),
        assoc('messages', append('Kiitos vastauksestasi!', state.messages))
      )(state)
    case 'questions/SUBMIT_ANSWERS_UNSUCCESSFUL':
      return pipe(
        assoc('fetching', false),
        assoc('messages', append('Jokin meni pieleen. Kokeile kohta uudestaan!', state.messages))
      )(state)
    default:
      return state
  }
}

const fetchQuestions = (questionDispatch) => () => {
  questionDispatch({
    type: 'questions/ASK_FOR_QUESTIONS'
  })
  axios.get('/getquestions')
    .then((res) => {
      const questionObjs = map(
        cond([
            [ (d) => equals(prop('type', d), 'scale'), assoc('answer', 0) ],
            [ (d) => equals(prop('type', d), 'linear'), assoc('answer', 5) ],
            [ (d) => equals(prop('type', d), 'text'), assoc('answer', '') ]
        ]),
        Object.values(res.data)
      )
      questionDispatch({
        type: 'questions/SERVER_RESPONDED_WITH_QUESTIONS',
        payload: questionObjs,
      })
    })
    .catch((e) => {
      questionDispatch({
        type: 'questions/ERROR_FETCHING_QUESTIONS',
        payload: {
          error: 'Viestejä ei voitu hakea. Uudelleenlataus saattaa auttaa.'
        }
      })
      setTimeout(() => {
        questionDispatch({
          type: 'questions/CLEAR_OLDEST_MESSAGE'
        })
      }, 7500)
    })
}

const getControlElement = (question, onChange) => {
  switch(question.type) {
    case('scale'):
    case('linear'):
      const qRange = question.type === 'linear' ? range(1, 11) : range(-5, 6)
      const checkboxes = map((n) => {
        return (
          <Form.Check
            key={`question-${question.id}-checkbox-${n}`}
            inline
            label={n}
            checked={n === question.answer}
            onChange={() => onChange(n)}
            type="radio"
        />)
      },
        qRange
      )
      return(
        <div>
          { checkboxes }
        </div>
      )
    case('text'):
      return(
        <Form.Control
          as="textarea"
          className="thin-textarea"
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    default:
      return(null)
  }
}

const Question = ({ question, onChange }) => {
  let controlElement = getControlElement(question, onChange)
  return(
    <Form.Group>
      <Form.Label>
        { question.question }
      </Form.Label>
      { controlElement }
    </Form.Group>
  )
}

const Answer = () => {
  const [questionState, questionDispatch] = useReducer(questionReducer, questionInitialState)
  useEffect(fetchQuestions(questionDispatch), [])
  console.log(questionState)

  const selectAnswer = (id) => (newAnswer) => {
    questionDispatch({
      type: 'questions/SELECT_ANSWER',
      payload: { id, newAnswer },
    })
  }

  const submit = (e) => {
    e.preventDefault()
    questionDispatch({ type: 'questions/SUBMIT_ANSWERS' })
    axios.post('/saveanswers', questionState)
      .then((res) => {
        questionDispatch({ type: 'questions/SUBMIT_ANSWERS_SUCCESSFUL' })
      })
      .catch((res) => {
        questionDispatch({ type: 'questions/SUBMIT_ANSWERS_UNSUCCESSFUL' })
      })
      .finally(() => {
        setTimeout(() => questionDispatch({ type: 'questions/CLEAR_OLDEST_MESSAGE' }), 7500)
      })
  }

  const questions = map((q) =>
    <Question
      key={`question-${q.id}`}
      question={q}
      onChange={selectAnswer(q.id)}
    />,
    questionState.questions
  )

  return (
    <Row id="answer-page">
      <Col>
        <Row>
          <Col className="messages-wrapper">
            <Messages
              messages={questionState.messages}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Miten hyvin menee?</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form>
              { questions }
              <Form.Group as={Row}>
                <Col>
                  <Button
                    type="submit"
                    onClick={submit}
                  >
                    Lähetä vastaukset
                  </Button>
                </Col>
              </Form.Group>
            </Form>
            <div className="spinner">
              <GooSpinner
                loading={questionState.fetching}
              />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Answer
