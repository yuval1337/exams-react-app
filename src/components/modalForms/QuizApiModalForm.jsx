import React from "react"
import {
  Row, Col, Modal, Button, ListGroup, ListGroupItem,
  Alert, Form, InputGroup, Spinner, Accordion, Badge
} from "react-bootstrap"
import { PiEye, PiEyeClosed } from "react-icons/pi"
import RangeSlider from "react-bootstrap-range-slider"; import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

import { default as api } from "../../api"
import { CATEGORIES, TAGS } from "./consts.js"
import "./index.css"


const range = n => [...Array(n).keys()].slice(1)

const QuizApiModalForm = ({ show, saveHandler, cancelHandler }) => {
  const [inputs, setInputs] = React.useState({
    apiKey: "VOZNHbvQRb0rmx9OYxp0gykxs0wP7bsdB5GabvfC",
    category: "",
    tag: "",
    limit: 1
  })
  const [loading, setLoading] = React.useState(false)

  const [questions, setQuestions] = React.useState([])
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [showAlert, setShowAlert] = React.useState(false)

  const inputsSetter = (key, value) => {
    setInputs({
      ...inputs,
      [key]: value
    })
  }

  const handleChangeInput = (event) => {
    event.preventDefault()
    inputsSetter(event.target.name, event.target.value)
  }

  const handleChangePoints = (event) => {
    const newQuestions = questions.map(question => {
      if (event.target.id === question.id) {
        question.points = event.target.value
      }
      return question
    })
    setQuestions(newQuestions)
  }

  const handleSearchQuestions = async () => {
    setLoading(true)
    const apiQuestions = await api.misc.quizApi(
      inputs.apiKey,
      inputs.category,
      inputs.tag,
      inputs.limit
    )
    if (apiQuestions) {
      if (apiQuestions.length < 1) {
        setShowAlert(true)
      }
      else {
        setQuestions(apiQuestions)
      }
      setLoading(false)
      return
    }
    else {
      return
    }
  }

  const handleClickButton = (event) => {
    event.preventDefault()
    switch (event.target.name) {
      case "Search":
        handleSearchQuestions()
        return

      case "Save":
        // TODO validation...
        saveHandler(questions)
        return

      case "Cancel":
        cancelHandler()
        return

      default:
        alert(`Clicked "${event.target.name}" button.`)
        return
    }
  }

  const handleRightClick = (questionId) => {
    const newQuestions = questions.filter(question => question.id !== questionId)
    setQuestions(newQuestions)
  }


  return (
    <Modal size="lg" show={show}>
      <Modal.Header>
        <Modal.Title>Add Questions from QuizAPI</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <ListGroup variant="flush">

          <ListGroupItem>
            <Form.Label>API Key</Form.Label>
            <InputGroup>
              <Form.Control
                name="apiKey"
                value={inputs.apiKey}
                type={showApiKey ? "text" : "password"}
                style={{ fontFamily: "monospace" }}
                onChange={handleChangeInput} />
              <Button
                variant="light"
                onMouseDown={() => setShowApiKey(!showApiKey)}
                onMouseUp={() => setShowApiKey(!showApiKey)}
                onMouseLeave={() => {
                  if (showApiKey === true) { setShowApiKey(false) }
                }}
                className="border">
                {showApiKey ? <PiEye /> : <PiEyeClosed />}
              </Button>
            </InputGroup>
          </ListGroupItem>

          <ListGroupItem>
            <Row>
              <Col>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={inputs.category}
                  onChange={handleChangeInput}>
                  <option value="">None</option>
                  {
                    CATEGORIES.map(
                      (item, idx) => <option key={idx} value={item}>{item}</option>
                    )
                  }
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Tag</Form.Label>
                <Form.Select
                  name="tag"
                  onChange={handleChangeInput}>
                  <option value="">None</option>
                  {
                    TAGS.map(
                      (item, idx) => <option key={idx} value={item}>{item}</option>
                    )
                  }
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Limit</Form.Label>
                <Form.Select
                  name="limit"
                  value={inputs.limit}
                  onChange={handleChangeInput}>
                  {
                    range(21).map(
                      (item, idx) => <option key={idx} value={item}>{item}</option>
                    )
                  }
                </Form.Select>
              </Col>
            </Row>
          </ListGroupItem>

          <ListGroupItem>
            <Button
              name="Search"
              className="w-100"
              disabled={loading}
              variant={loading ? "secondary" : "outline-primary"}
              onClick={handleClickButton}>{loading ? <Spinner size="sm" /> : "Search"}</Button>
          </ListGroupItem>

          <ListGroupItem className="p-0">
            <Accordion>
              {
                showAlert ? <Alert dismissible className="d-flex justify-content-center" variant="danger">{`Nothing was found... ¯\\_(ツ)_/¯`}</Alert> :
                  questions.map((question, idx) => (
                    <Accordion.Item
                      key={`question_${idx}`}
                      eventKey={idx}
                      onContextMenu={event => { event.preventDefault(); handleRightClick(question.id) }}>
                      <Accordion.Header>
                        {question.question}
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <ListGroup.Item >
                          <Form.Label>Points</Form.Label>
                          <Row>
                            <Col xs="2" className="pe-0 d-flex justify-content-start align-items-center">
                              <Badge className="w-75 fs-6 me-0">{questions[idx].points}</Badge>
                            </Col>
                            <Col className="ps-0">
                              <RangeSlider
                                id={question.id}
                                value={questions[idx].points}
                                min={5}
                                max={100}
                                step={5}
                                tooltip="off"
                                onChange={handleChangePoints} />
                            </Col>
                          </Row>
                        </ListGroup.Item>
                        {question.answers.map((answer, idx) => (
                          <ListGroupItem
                            key={`answer_${idx}`}
                            variant={answer.id === question.correctAnswer ? "success" : "danger"}>
                            {idx + 1}. {answer.answer}
                          </ListGroupItem>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))

              }
            </Accordion>
          </ListGroupItem>

        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button name="Cancel" variant="outline-secondary" style={{ width: "75px" }} onClick={handleClickButton}>Cancel</Button>
        <Button name="Save" disabled={questions.length === 0} variant="primary" style={{ width: "75px" }} onClick={handleClickButton}>Save</Button>
      </Modal.Footer>
    </Modal>
  )
}


export default QuizApiModalForm