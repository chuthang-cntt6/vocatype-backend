// 📄 VocaTypeDictionary.jsx
import React, { useEffect, useState } from "react";

export default function VocaTypeDictionary() {
  const [word, setWord] = useState(localStorage.getItem("selectedWord") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Khi có từ được chọn => tự động tra
  useEffect(() => {
    if (word) {
      setLoading(true);
      fetch(`http://localhost:3000/api/vocab/search?word=${word}`)
        .then((res) => res.json())
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Không thể kết nối server.");
          setLoading(false);
        });
    }
  }, [word]);

  // Giao diện tra cứu
  return (
    <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>VocaType Dictionary</h2>

      <input
        type="text"
        placeholder="Nhập từ cần tra..."
        value={word}
        onChange={(e) => setWord(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 6,
          marginBottom: 12,
        }}
      />

      <button
        onClick={() => {
          if (word.trim()) {
            setLoading(true);
            fetch(`http://localhost:3000/api/vocab/search?word=${word}`)
              .then((res) => res.json())
              .then((data) => {
                setResult(data);
                setLoading(false);
              })
              .catch(() => {
                setError("Không thể kết nối server.");
                setLoading(false);
              });
          }
        }}
        style={{
          padding: "8px 12px",
          border: "none",
          background: "#2b5df0",
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Tra cứu
      </button>

      {loading && <p>🔍 Đang tra...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && Array.isArray(result) && result.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>Kết quả:</h4>
          {result.map((item, i) => (
            <div
              key={i}
              style={{
                background: "#f9f9f9",
                padding: 8,
                borderRadius: 6,
                marginBottom: 6,
              }}
            >
              <strong>{item.word}</strong>
              <div>{item.meaning}</div>
              {item.phonetic && (
                <div style={{ fontStyle: "italic" }}>{item.phonetic}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {result && result.length === 0 && !loading && (
        <p>❌ Không tìm thấy từ này.</p>
      )}
    </div>
  );
}
