import React from "react"
import * as AuthKit from "react-auth-kit"
import * as RouterDom from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { Row, Col, Button, Tabs, Tab, Spinner } from "react-bootstrap"

import { Forms, PageContainers } from "../components"
import { default as storage } from "../storage"


const CreateExamPage = () => {
  const [loadingSave, setLoadingSave] = React.useState(false)
  const authUser = AuthKit.useAuthUser()
  const navigate = RouterDom.useNavigate()

  const metadataFormRef = React.useRef()
  const questionsFormRef = React.useRef()

  const handleClickButton = async (buttonName) => {
    switch (buttonName) {
      case "form-cancel":
        return navigate("/")

      case "form-save":
        setLoadingSave(true)
        const metadata = metadataFormRef.current.get()
        const questions = questionsFormRef.current.get()
        const exam = {
          id: uuidv4(),
          author: authUser().username,
          ...metadata,
          ...questions
        }
        const storageResponse = await storage.stores.localExams.save(exam)
        if (storageResponse) {
          setTimeout(() => {
            navigate("/my-exams")
          }, 500)
        }
        else {
          setLoadingSave(false)
        }
        return

      default:
        return
    }
  }

  if (authUser().privilege === "lecturer") {
    return (
      <PageContainers.PostLogin>
        <Row>

          <Col xs="12" className="my-3">
            <span className="fs-4">Create a New Exam:</span>
          </Col>

          <Col xs="12">
            <Tabs defaultActiveKey="metadata" transition={false} >
              <Tab eventKey="metadata" title="Metadata">
                <div className="border" style={{ height: "50vh", overflowY: "auto" }}>
                  <Forms.ExamMetadata ref={metadataFormRef} />
                </div>
              </Tab>
              <Tab eventKey="questions" title="Questions">
                <div className="border" style={{ height: "50vh", overflowY: "auto", overflowX: "hidden" }}>
                  <Forms.ExamQuestions ref={questionsFormRef} />
                </div>
              </Tab>
            </Tabs>
          </Col>

          <Col xs="12" className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              style={{ width: "100px" }}
              onClick={() => handleClickButton("form-cancel")}>
              Cancel
            </Button>
            <Button
              variant={loadingSave ? "secondary" : "primary"}
              className="ms-1"
              style={{ width: "100px" }}
              onClick={() => handleClickButton("form-save")}>
              {loadingSave ? <Spinner size="sm" /> : "Save"}
            </Button>
          </Col>

        </Row>
      </PageContainers.PostLogin>
    )
  }
  else {
    return <RouterDom.Navigate to="/" />
  }
}

export default CreateExamPage
