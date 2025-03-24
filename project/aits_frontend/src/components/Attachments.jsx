import { useState } from "react";

const Attachments = ({ issueId }) => {
  const [attachments, setAttachments] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachments([...attachments, { id: attachments.length + 1, name: file.name, size: file.size }]);
    }
  };

  return (
    <div>
      <h3>Attachments</h3>
      <ul>
        {attachments.map((attachment) => (
          <li key={attachment.id}>{attachment.name} ({attachment.size} bytes)</li>
        ))}
      </ul>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default Attachments;