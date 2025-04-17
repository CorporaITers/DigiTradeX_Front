// src/pages/Booking.jsx
import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const Booking = () => {
  const { poId } = useParams();
  const [statuses, setStatuses] = useState({});
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const handleSearch = async () => {
    try {
      const response = await fetch("https://【バックエンドURL】/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departure,
          destination,
          etd,
          eta,
        }),
      });
  
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("レコメンド取得失敗:", error);
    }
  };

  //　ボタンはトグル動作
  const handleStatusChange = (id, status) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === status ? null : status 
    }));
  };
  
  const [recommendations, setRecommendations] = useState([]);
  const location = useLocation();
  const po = location.state?.po;

  if (!po) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 text-lg font-bold">
          PO情報が見つかりませんでした。
        </p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="nav-header">
        <div className="app-logo">DTX Booking</div>
        <div className="nav-buttons">
          <button className="nav-button">PO読取</button>
          <button className="nav-button">一覧</button>
          <button className="nav-button active">船ブッキング</button>
          <button className="nav-button">HarborWrite</button>
        </div>
      </div>

      <main className="main-content">
        <section className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">PO情報（PO No: {po.poNumber}）</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>出荷地:</strong> {po.shipFrom}</div>
            <div><strong>宛先:</strong> {po.destination}</div>
            <div><strong>発注ユーザー:</strong> {po.manager}</div>
            <div><strong>製品名:</strong> {po.productName}</div>
            <div><strong>数量:</strong> {po.quantity}</div>
            <div><strong>金額:</strong> {po.amount}</div>
            <div><strong>ETD:</strong> {po.etd}</div>
            <div><strong>ETA:</strong> {po.eta}</div>
          </div>
        </section>

        {/* スケジュール検索欄 */}
       <section className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">スケジュール検索</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(); // ← 検索ボタンを押したときの処理
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="block font-medium mb-1">出港地</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">目的地</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">出港予定日（ETD）</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={etd}
                onChange={(e) => setEtd(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">到着予定日（ETA）</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </div>
            <div className="col-span-2 text-right">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                レコメンド取得
              </button>
            </div>
          </form>
        </section>

        {/*レコメンド一覧*/}
        <section className="bg-white rounded shadow p-6 mb-8">
         <h2 className="text-lg font-bold mb-4">レコメンド一覧</h2>

         {recommendations.length === 0 ? (
            <p className="text-gray-500">検索結果がまだありません。</p>
          ) : (
           <ul className="space-y-4">
              {recommendations.map((rec) => (
               <li
               key={rec.id}
               className={`border p-4 rounded shadow-sm ${
                 statuses[rec.id] === "accept"
                   ? "bg-blue-100"
                   : statuses[rec.id] === "processing"
                   ? "bg-red-100"
                   : statuses[rec.id] === "reject"
                   ? "bg-gray-200"
                   : "bg-white"
               }`}
               >
                 <p><strong>船会社:</strong> <a href={rec.loginUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{rec.carrier}</a></p>
                 <p><strong>船名:</strong> {rec.ship}</p>
                 <p><strong>運賃:</strong> ¥{rec.price.toLocaleString()}</p>
                 <p><strong>ETD:</strong> {rec.etd} ／ <strong>ETA:</strong> {rec.eta}</p>
                 <p>
                   <a href={rec.schedulePdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                     スケジュールPDFを見る
                    </a>
                  </p>

                  <div className="mt-4 flex gap-2">
                    {["accept", "processing", "reject"].map((statusType) => {
                      const isSelected = statuses[rec.id] === statusType;

                      const baseStyle = "px-3 py-1 rounded text-white text-sm font-bold";
                      const colorStyle =
                        statusType === "accept"
                          ? isSelected
                            ? "bg-blue-700"
                            : "bg-blue-500 hover:bg-blue-600"
                          : statusType === "processing"
                            ? isSelected
                            ? "bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                          : isSelected
                          ? "bg-gray-700"
                          : "bg-gray-500 hover:bg-gray-600";

                       const label = {
                       accept: "Accept",
                       processing: "Processing",
                       reject: "Reject",
                    };

                      return (
                        <button
                           key={statusType}
                           onClick={() => handleStatusChange(rec.id, statusType)}
                           className={`${baseStyle} ${colorStyle}`}
                        >
                          {label[statusType]}
                        </button>
                     );
                   })}
                  </div>
                </li>
             ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Booking; 