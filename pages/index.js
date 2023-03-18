import { useState, useEffect } from "react";
import Head from "next/head";
import { GithubIcon } from "components/icons/GithubIcon";
import ImageUploading from "react-images-uploading";
import { generateZip } from "utils/zip";

const SAMPLE_PRODUCTS = {
  0: {
    name: "Green baseball cap",
    url: "https://replicate.delivery/pbxt/07eIejhUvqkTAkJjVHTa3ToNRPB7EyeqC2qCkujpjblXFb5gA/tmpbxur32g9hatLoraTestzip.safetensors",
  },
  1: {
    name: "Shirt",
    url: "https://replicate.delivery/pbxt/YsidtdrYQL7MPpFdzyAizqeuq9vX05gYTof7AVNqfD2XaUDhA/tmp201_emx0shirtTestzip.safetensors",
  },
};

const SAMPLE_FACES = [
  {
    name: "Sam",
    url: "https://replicate.delivery/pbxt/ILlJKa9SgBL3BNeTpPIpvqwzpJM5XpyLC16a1yEFhIioqVPIA/tmpel3om_fusampngzip.safetensors",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sampleProduct, setSampleProduct] = useState(SAMPLE_PRODUCTS[0].name);

  const [products, setProducts] = useState([]);
  const [trainFlag, setTrainFlag] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [productUrl, setProductUrl] = useState(SAMPLE_PRODUCTS[0].url);
  const [userImageUrl, setUserImageUrl] = useState(SAMPLE_FACES[0].url);
  const [finalResult, setResult] = useState([]);

  const maxNumber = 69;

  const onProductsChange = (imageList) => {
    setProducts(imageList);
  };

  const onUsersChange = (users) => {
    setUserImages(users);
  };

  const trainProducts = async () => {
    const zipUrl = await generateZip(products);
    const response = await fetch("/api/lora", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_data: zipUrl,
        resolution: 512,
        task: "object",
      }),
    });
    let multi = await response.json();
    setPrediction(multi);
    const predictionId = multi.id;
    if (response.status !== 201) {
      setError(multi.detail);
      return;
    }
    while (multi.status !== "succeeded" && multi.status !== "failed") {
      await sleep(1000);
      const response = await fetch("/api/lora/" + predictionId);
      const prediction = await response.json();
      multi = prediction;
      if (response.status !== 200) {
        setError(multi.detail);
        return;
      }
      setPrediction(prediction);
    }

    setProductUrl(multi.output);
  };

  const trainUserImages = async () => {
    const zipUrl = await generateZip(userImages);
    const response = await fetch("/api/lora", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_data: zipUrl,
        resolution: 512,
        task: "face",
      }),
    });
    let multi = await response.json();
    setPrediction(multi);
    const predictionId = multi.id;
    if (response.status !== 201) {
      setError(multi.detail);
      return;
    }
    while (multi.status !== "succeeded" && multi.status !== "failed") {
      await sleep(1000);
      const response = await fetch("/api/lora/" + predictionId);
      const prediction = await response.json();
      multi = prediction;
      if (response.status !== 200) {
        setError(multi.detail);
        return;
      }
      setPrediction(prediction);
    }

    setUserImageUrl(multi.output);
  };

  const upload = async () => {
    const promises = products.length
      ? [trainProducts(), trainUserImages()]
      : [trainUserImages()];
    setTrainFlag(true);
    await Promise.all([...promises]);
    setTrainFlag(false);
  };

  const generateImages = async () => {
    setLoading(true);
    const payload = JSON.stringify({
      prompt:
        "RAW photo <2> wearing <1>, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3",
      negative_prompt:
        "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck",
      lora_urls: `${productUrl} | ${userImageUrl}`,
      lora_scales: "0.5 | 0.5",
      num_outputs: "4",
      height: 512,
      width: 512,
      num_inference_steps: "50",
      guidance_scale: "3.5",
    });

    const response = await fetch("/api/realistic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    let multi = await response.json();
    setPrediction(multi);
    const predictionId = multi.id;
    if (response.status !== 201) {
      setError(multi.detail);
      return;
    }
    while (multi.status !== "succeeded" && multi.status !== "failed") {
      await sleep(1000);
      const response = await fetch("/api/lora/" + predictionId);
      const prediction = await response.json();
      multi = prediction;
      if (response.status !== 200) {
        setError(multi.detail);
        return;
      }
      setPrediction(prediction);
    }
    setResult(multi.output);
    setLoading(false);
  };

  const onSetSampleProduct = (e) => {
    const indexOfSampleProduct = e.target.value;
    setSampleProduct(indexOfSampleProduct);
    setProductUrl(SAMPLE_PRODUCTS[indexOfSampleProduct].url);
  };

  const resultContent = finalResult.map((image, index) => (
    <div key={index} className="image-item">
      <img src={image} alt="Final result image" />
    </div>
  ));

  return (
    <>
      <Head>
        <title>Fashion app</title>
        <meta name="description" content="Fashion app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="header">
        <a
          href="https://github.com/vana-com/vana-mit-hackathon"
          target="_blank"
        >
          <GithubIcon />
        </a>
      </header>
      <main className="main">
        <h1>Fashion App</h1>
        <div className="content container">
          <div className="space-y-4">
            <div className="products-slot">
              <div className="products-slot-title">Choose what to wear</div>
              <div className="default-wears">
                <select value={sampleProduct} onChange={onSetSampleProduct}>
                  <option value="0">{SAMPLE_PRODUCTS[0].name}</option>
                  <option value="1">{SAMPLE_PRODUCTS[1].name}</option>
                </select>
              </div>
              <ImageUploading
                multiple
                value={products}
                onChange={onProductsChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
                acceptType={["jpg", "jpeg", "png"]}
              >
                {({
                  imageList,
                  onImageUpload,
                  onImageRemoveAll,
                  onImageUpdate,
                  onImageRemove,
                  isDragging,
                  dragProps,
                }) => (
                  <>
                    <button
                      style={isDragging ? { color: "red" } : null}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      Or upload your own images
                    </button>
                    <div className="uploaded-products">
                      {products.map((image, index) => (
                        <div key={index} className="image-item">
                          <img src={image.data_url} alt="Product image" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ImageUploading>
            </div>
            {productUrl && (
              <div className="users-slot">
                <div className="users-slot-title">Upload user images</div>
                <ImageUploading
                  multiple
                  value={userImages}
                  onChange={onUsersChange}
                  maxNumber={maxNumber}
                  dataURLKey="data_url"
                  acceptType={["jpg", "jpeg", "png"]}
                >
                  {({
                    imageList,
                    onImageUpload,
                    onImageRemoveAll,
                    onImageUpdate,
                    onImageRemove,
                    isDragging,
                    dragProps,
                  }) => (
                    <>
                      <button
                        style={isDragging ? { color: "red" } : null}
                        onClick={onImageUpload}
                        {...dragProps}
                      >
                        Click or Drop here
                      </button>
                      <div className="uploaded-products">
                        {userImages.map((image, index) => (
                          <div key={index} className="image-item">
                            <img src={image.data_url} alt="Product image" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </ImageUploading>
              </div>
            )}
            <button className="train-button" onClick={upload}>
              Train
            </button>
            {trainFlag && (
              <>
                <p className="wait">Please wait 6 minutes</p>
                <img
                  src="/loading.gif"
                  alt="Loading..."
                  className="loading-spinner"
                />
              </>
            )}

            <div className="result-list">
              <div className="users-slot-title">Result images</div>
              <button className="generate-images" onClick={generateImages}>
                Generate Realistic Images
              </button>
              <div className="uploaded-products">
                {loading ? (
                  <img
                    src="/loading.gif"
                    alt="Loading..."
                    className="loading-spinner"
                  />
                ) : (
                  <>{resultContent}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
