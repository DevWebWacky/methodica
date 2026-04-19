import { jsPDF } from 'jspdf'

function ExportButton({ results, studies, formData }) {

  function generatePDF() {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let y = 20

    function addText(text, x, fontSize, fontStyle, color) {
      doc.setFontSize(fontSize)
      doc.setFont('Montserrat', fontStyle || 'normal')
      doc.setTextColor(...(color || [0, 0, 0]))
      const lines = doc.splitTextToSize(String(text), maxWidth)
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(line, x, y)
        y += fontSize * 0.5
      })
      y += 4
    }

    function addSectionHeader(title, color) {
      if (y > 250) { doc.addPage(); y = 20 }
      y += 4
      doc.setFillColor(...color)
      doc.roundedRect(margin, y - 6, maxWidth, 10, 2, 2, 'F')
      doc.setFontSize(11)
      doc.setFont('montserrat', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(title, margin + 4, y + 1)
      y += 10
      doc.setTextColor(0, 0, 0)
    }

    // ── HEADER ──
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, 35, 'F')
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('METHODICA', margin, 16)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text('Your Intelligent Research Methodology Assistant', margin, 24)
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })}`, margin, 31)
    y = 45

    // ── RESEARCH DETAILS ──
    addSectionHeader('RESEARCH DETAILS', [15, 23, 42])
    addText(`Topic: ${formData.topic}`, margin, 10, 'bold', [15, 23, 42])
    addText(`Field: ${formData.field}`, margin, 9, 'normal', [55, 65, 81])
    addText(`Education Level: ${formData.educationLevel}`, margin, 9, 'normal', [55, 65, 81])
    addText(`Study Nature: ${formData.studyNature}  |  Direction: ${formData.studyDirection}`, margin, 9, 'normal', [55, 65, 81])
    addText(`Outcome Variable: ${formData.outcomeVariable}  |  Confidence: ${formData.confidenceLevel}%`, margin, 9, 'normal', [55, 65, 81])
    addText(`Target Population: ${formData.targetPopulation}`, margin, 9, 'normal', [55, 65, 81])
    if (formData.objectives) {
      addText(`Objectives: ${formData.objectives}`, margin, 9, 'normal', [55, 65, 81])
    }
    if (formData.hypotheses) {
      addText(`Hypotheses: ${formData.hypotheses}`, margin, 9, 'normal', [55, 65, 81])
    }
    y += 4

    // ── STUDY DESIGN ──
    addSectionHeader('RECOMMENDED STUDY DESIGN', [30, 58, 138])
    addText(results.studyDesign.recommendation, margin, 12, 'bold', [30, 58, 138])
    addText(results.studyDesign.justification, margin, 9, 'normal', [55, 65, 81])
    y += 4

    // ── SAMPLING TECHNIQUE ──
    addSectionHeader('RECOMMENDED SAMPLING TECHNIQUE', [15, 118, 110])
    addText(results.samplingTechnique.recommendation, margin, 12, 'bold', [15, 118, 110])
    addText(results.samplingTechnique.justification, margin, 9, 'normal', [55, 65, 81])
    y += 4

    // ── SAMPLE SIZE ──
    addSectionHeader('RECOMMENDED SAMPLE SIZE', [109, 40, 217])
    addText(`n = ${results.sampleSize.recommendation}`, margin, 14, 'bold', [109, 40, 217])
    addText(`Formula: ${results.sampleSize.formula}`, margin, 9, 'italic', [109, 40, 217])
    addText(results.sampleSize.justification, margin, 9, 'normal', [55, 65, 81])
    y += 4

    // ── STATISTICAL TESTS ──
    addSectionHeader('RECOMMENDED STATISTICAL TESTS', [190, 18, 60])
    results.statisticalTests.forEach((item, index) => {
      if (y > 250) { doc.addPage(); y = 20 }
      addText(`Objective ${index + 1}: ${item.objective}`, margin, 8, 'italic', [107, 114, 128])
      addText(item.test, margin, 11, 'bold', [190, 18, 60])
      addText(item.justification, margin, 9, 'normal', [55, 65, 81])
      y += 2
    })
    y += 4

    // ── DATA COLLECTION ──
    if (results.dataCollection) {
      addSectionHeader('DATA COLLECTION TOOLS', [194, 65, 12])
      results.dataCollection.recommendedTools.forEach((tool, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${tool.tool} (${tool.free ? 'Free' : 'Paid'})`, margin, 10, 'bold', [194, 65, 12])
        addText(tool.reason, margin, 9, 'normal', [55, 65, 81])
        y += 2
      })
      y += 2
      addText('Data Management Steps:', margin, 10, 'bold', [15, 23, 42])
      results.dataCollection.dataManagementSteps.forEach((step, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${step.title}`, margin, 9, 'bold', [55, 65, 81])
        addText(step.description, margin, 9, 'normal', [107, 114, 128])
        y += 1
      })
      y += 4
    }

    // ── DESCRIPTIVE STATISTICS ──
    if (results.descriptiveStatistics) {
      addSectionHeader('DESCRIPTIVE STATISTICS', [8, 145, 178])
      addText(results.descriptiveStatistics.explanation, margin, 9, 'normal', [55, 65, 81])
      results.descriptiveStatistics.recommended.forEach((item, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${item.measure}`, margin, 9, 'bold', [8, 145, 178])
        addText(item.reason, margin, 9, 'normal', [107, 114, 128])
        y += 1
      })
      y += 4
    }

    // ── SOFTWARE ──
    if (results.softwareRecommendations) {
      addSectionHeader('RECOMMENDED SOFTWARE', [109, 40, 217])
      results.softwareRecommendations.forEach((item, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${item.software} (${item.free ? 'Free' : 'Paid'})`, margin, 10, 'bold', [109, 40, 217])
        addText(item.purpose, margin, 9, 'normal', [55, 65, 81])
        addText(item.levelSuitability, margin, 8, 'italic', [107, 114, 128])
        y += 2
      })
      y += 4
    }

    // ── VISUALIZATIONS ──
    if (results.visualizations) {
      addSectionHeader('RECOMMENDED VISUALIZATIONS', [161, 98, 7])
      results.visualizations.forEach((item, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${item.plot}`, margin, 10, 'bold', [161, 98, 7])
        addText(`For: ${item.variable}`, margin, 8, 'italic', [107, 114, 128])
        addText(item.reason, margin, 9, 'normal', [55, 65, 81])
        y += 2
      })
      y += 4
    }

    // ── JOURNALS ──
    if (results.journals && results.journals.length > 0) {
      addSectionHeader('RECOMMENDED JOURNALS', [37, 99, 235])
      results.journals.forEach((journal, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${journal.name}`, margin, 10, 'bold', [37, 99, 235])
        addText(`Type: ${journal.type} | Impact Factor: ${journal.impactFactor}`, margin, 8, 'normal', [107, 114, 128])
        addText(journal.relevance, margin, 9, 'normal', [55, 65, 81])
        y += 2
      })
      y += 4
    }

    // ── ADDITIONAL RECOMMENDATIONS ──
    addSectionHeader('ADDITIONAL RECOMMENDATIONS', [15, 118, 110])
    addText(results.additionalRecommendations, margin, 9, 'normal', [55, 65, 81])
    y += 4

    // ── SIMILAR STUDIES ──
    if (studies && studies.length > 0) {
      addSectionHeader('SIMILAR PUBLISHED STUDIES (PubMed)', [15, 118, 110])
      studies.forEach((study, index) => {
        if (y > 255) { doc.addPage(); y = 20 }
        addText(`${index + 1}. ${study.title}`, margin, 9, 'bold', [15, 118, 110])
        addText(`${study.authors} | ${study.journal} | ${study.year}`, margin, 8, 'normal', [107, 114, 128])
        addText(`PubMed: ${study.link}`, margin, 8, 'normal', [37, 99, 235])
        y += 2
      })
    }

    // ── FOOTER ──
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(156, 163, 175)
      doc.text(
        `Methodica | Generated ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
        margin, 290
      )
    }

    // ── SAVE ──
    const fileName = `Methodica_${formData.topic.substring(0, 30).replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)
  }

  return (
    <button
      onClick={generatePDF}
      className="w-full bg-green-600 hover:bg-green-500
      text-white font-black py-4 rounded-2xl text-lg shadow-xl
      hover:scale-105 transition-all duration-300 mb-4">
      Download PDF Report
    </button>
  )
}

export default ExportButton