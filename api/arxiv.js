// ArXiv API proxy to bypass CORS issues
export default async function handler(req, res) {
  const { search_query, start = 0, max_results = 10, sortBy = 'relevance', sort_order = 'descending' } = req.query;
  
  if (!search_query) {
    return res.status(400).json({ error: 'search_query parameter is required' });
  }

  try {
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${search_query}&start=${start}&max_results=${max_results}&sortBy=${sortBy}&sort_order=${sort_order}`;
    
    const response = await fetch(arxivUrl, {
      headers: {
        'User-Agent': 'IdeaForge-Vision/1.0',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`ArXiv API returned ${response.status}: ${response.statusText}`);
    }

    const xmlData = await response.text();
    
    // Set appropriate headers for XML response
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).send(xmlData);
  } catch (error) {
    console.error('ArXiv proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from ArXiv API', details: error.message });
  }
}
