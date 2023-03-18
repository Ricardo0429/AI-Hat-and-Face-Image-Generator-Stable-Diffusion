export default async function handler(req, res) {
  const response = await fetch("https://replicate.delivery", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      multipart: "form-data",
    },
    body: req.body,
  });

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const uploads = await response.json();
  res.statusCode = 201;
  res.end(JSON.stringify(uploads));
}
