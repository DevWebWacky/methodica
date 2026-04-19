// pubmedService.js
// This file handles all communication with the PubMed API
// PubMed is a free database of biomedical research papers
// We use it to find real similar studies for the user

// This function searches PubMed for studies related to the topic
export async function searchSimilarStudies(topic, field) {

  // We combine topic and field for a better search
  const searchQuery = `${topic} ${field}`
  const encodedQuery = encodeURIComponent(searchQuery)

  console.log('Searching PubMed for:', searchQuery)

  // Step 1 — Search PubMed for matching article IDs
  // We limit to 5 results for the MVP
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmax=5&retmode=json&sort=relevance`

  const searchResponse = await fetch(searchUrl)
  const searchData = await searchResponse.json()

  // Extract the list of article IDs
  const ids = searchData.esearchresult.idlist

  console.log('Found PubMed IDs:', ids)

  // If no results found return empty array
  if (!ids || ids.length === 0) {
    return []
  }

  // Step 2 — Fetch full details for each article
  const idsString = ids.join(',')
  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idsString}&retmode=json`

  const fetchResponse = await fetch(fetchUrl)
  const fetchData = await fetchResponse.json()

  // Step 3 — Format the results nicely
  const studies = ids.map(id => {
    const article = fetchData.result[id]
    return {
      id: id,
      title: article.title || 'Title not available',
      authors: article.authors
        ? article.authors.slice(0, 3).map(a => a.name).join(', ')
        : 'Authors not available',
      journal: article.fulljournalname || article.source || 'Journal not available',
      year: article.pubdate
        ? article.pubdate.substring(0, 4)
        : 'Year not available',
      link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
    }
  })

  console.log('Formatted studies:', studies)
  return studies
}