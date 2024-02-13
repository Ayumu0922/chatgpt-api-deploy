"use client";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [openAIResponse, setOpenAIResponse] = useState<string>("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) {
      window.alert("ファイルを選択してください");
      return;
    }
    const file = event.target.files[0];

    // ブラウザが提供するAPIの一つで、ローカルファイルを非同期に読み込むために使用
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        console.log(reader.result);
      }
    };
    reader.onerror = (error) => {
      console.log("error:" + error);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (image === "") {
      alert("画像をアップロードしてください");
      return;
    }

    // POST api/analizeImage
    await fetch("api/analyzeImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: image,
      }),
    }).then(async (response: any) => {
      const reader = response.body?.getReader();

      setOpenAIResponse("");

      while (true) {
        const { done, value } = await reader?.read();

        if (done) {
          break;
        }

        var currentChunk = new TextDecoder().decode(value);

        // この部分で既存のレスポンステキスト（prev）に新しく読み取られたチャンク（currentChunk）を追加します。
        // これにより、新しいデータがストリームから到着するたびに、画面上の表示が更新されます。
        setOpenAIResponse((prev) => prev + currentChunk);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-800">
      <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-lg border border-blue-200 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">
          説明してほしい画像をアップロードしてください
        </h2>
        {image !== "" ? (
          <div className="mb-6 overflow-hidden">
            <img
              src={image}
              className="w-full object-contain max-h-96 rounded-lg shadow-sm"
              alt="Uploaded"
            />
          </div>
        ) : (
          <div className="mb-6 p-8 text-center border border-dashed border-blue-300 rounded-lg font-bold text-blue-500">
            <p>画像をアップロードするとここに表示されます</p>
          </div>
        )}
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="flex flex-col mb-6">
            <label className="mb-2 font-bold text-blue-700">
              画像をアップロード
            </label>
            <input
              onChange={(e) => handleFileChange(e)}
              type="file"
              className="font-bold text-sm text-blue-700 bg-blue-50 border border-blue-300 rounded-lg cursor-pointer file:py-2 file:px-4 file:border-blue-500 file:text-white file:bg-blue-700 hover:file:bg-blue-800 transition duration-300 ease-in-out"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-700 text-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-95 hover:bg-blue-600 font-bold"
            >
              画像の説明を生成する
            </button>
          </div>
        </form>
        {openAIResponse !== "" ? (
          <div className="border-t border-blue-200 pt-4 mt-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700">AIの説明</h2>
            <p className="text-blue-600">{openAIResponse}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
