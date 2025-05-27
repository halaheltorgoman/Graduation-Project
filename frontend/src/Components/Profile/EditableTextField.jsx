import { useState } from "react";
import { Input } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import "./EditableTextField.css";

const { TextArea } = Input;

const EditableTextField = ({
  value,
  setValue,
  placeholder = "Enter text...",
  width = 200,
  color = "white",
  fontWeight = "normal",
  fontSize = "16px",
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ position: "relative", width }}>
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: 1, maxRows: 2 }}
        disabled={!isEditing}
        className={`custom-textarea ${isEditing ? "editing" : "centered"}`}
        style={{
          color,
          fontWeight,
          fontSize,
          width: "100%",
          cursor: isEditing ? "text" : "default",
        }}
      />
      <div className="icon-container" onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? <CheckOutlined /> : <EditOutlined />}
      </div>
    </div>
  );
};

export default EditableTextField;
