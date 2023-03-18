export default async function handler(req, res) {
  const body = JSON.stringify({
    version: "b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc",
    input: req.body,
  });

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const lora = await response.json();
  res.statusCode = 201;
  res.end(JSON.stringify(lora));
}
