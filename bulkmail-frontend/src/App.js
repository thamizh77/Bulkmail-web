import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function App() {
  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setemailList] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;


  function handlemsg(e) {
    setmsg(e.target.value);
  }

  function handlefile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (evt) {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emails = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalEmail = emails.map((item) => item.A).filter(Boolean);
      setemailList(totalEmail);
    };

    reader.readAsBinaryString(file);
  }

  function send() {
    if (!msg || emailList.length === 0) {
      alert("Message or email list missing");
      return;
    }

    setstatus(true);

    axios
      .post(`${API_URL}/sendemail`, {
        msg,
        emailList,
      })
      .then((res) => {
        if (res.data.success) {
          alert("Emails sent successfully ✅");
          setmsg("");
          setemailList([]);
        } else {
          alert("Failed to send emails ❌");
        }
        setstatus(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Server error ❌");
        setstatus(false);
      });
  }

  return (
    <div className="text-center">
      <div className="bg-blue-950 text-white py-5">
        <h1 className="text-2xl font-medium">Bulk Mail App</h1>
      </div>

      <div className="bg-blue-400 flex flex-col items-center px-5 py-3">
        <textarea
          onChange={handlemsg}
          value={msg}
          className="w-[80%] h-32 py-2 outline-none px-2 border border-black rounded-md"
          placeholder="Enter the email text"
        ></textarea>
      </div>

      <div className="bg-blue-400">
        <input
          type="file"
          onChange={handlefile}
          className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
        />
      </div>

      <p className="bg-blue-400">
        Total Emails in the file: {emailList.length}
      </p>

      <div className="bg-blue-400">
        <button
          onClick={send}
          disabled={status}
          className="bg-blue-950 px-4 py-2 mt-2 text-white font-medium rounded-md mb-4"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
