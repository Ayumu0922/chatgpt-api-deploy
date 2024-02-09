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
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="w-full max-w-2xl rounded-lg shadow-md p-8 m-4 bg-white">
        <h2 className="text-xl font-bold mb-4 text-purple-600">
          説明してほしい画像をアップロードしてください
        </h2>
        {image !== "" ? (
          <div className=" mb-4 overflow-hidden">
            <img
              src={image}
              className=" w-full object-contain max-h-72"
              alt="no image"
            />
          </div>
        ) : (
          <div className="mb-4 p-8 text-center border border-dashed border-purple-200 rounded font-bold">
            <p>画像をアップロードするとここに表示されます</p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="flex flex-col mb-6">
            <label className="mb-2 text-sm font-bold text-purple-600">
              画像をアップロード
            </label>
            <input
              onChange={(e) => handleFileChange(e)}
              type="file"
              className=" font-bold text-sm text-purple-600 border border-purple-200 rounded-lg cursor-pointer file:py-2 file:px-4 file:border-purple-500 file:text-white file:bg-purple-600 hover:file:bg-purple-700 transition duration-300 ease-in-out"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="p-2 bg-purple-600 text-white rounded-lg shadow transform transition duration-300 ease-in-out hover:scale-95 hover:shadow-sm font-bold"
            >
              画像の説明を生成する
            </button>
          </div>
        </form>

        {openAIResponse !== "" ? (
          <div className="border-t border-purple-200 pt-4 mt-4">
            <h2 className="text-xl font-bold mb-2 text-purple-600">AIの説明</h2>
            <p>{openAIResponse}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
