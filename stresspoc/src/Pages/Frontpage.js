import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const Frontpage = () => {
  return (
    <Row id="frontpage">
      <Col>
        <p>
          Hei! Tämä on StressiPoC. Sen tarkoituksena on tutkia väyliä, joiden avulla
          lääketieteen ammattilaiset voisivat raportoida tilanteesta kentällä mahdollisimman
          rehellisesti ja helposti.
        </p>
      </Col>
    </Row>
  )
}

export default Frontpage
