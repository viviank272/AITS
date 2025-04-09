import React from "react";
import "./variables.css";

const VariableComponent = ({ role, title, description }) => {
  // Determine the role-specific styles
  const roleStyles = {
    student: {
      primaryColor: "var(--student-primary-color)",
      secondaryColor: "var(--student-secondary-color)",
      accentColor: "var(--student-accent-color)",
    },
    lecturer: {
      primaryColor: "var(--lecturer-primary-color)",
      secondaryColor: "var(--lecturer-secondary-color)",
      accentColor: "var(--lecturer-accent-color)",
    },
    admin: {
      primaryColor: "var(--admin-primary-color)",
      secondaryColor: "var(--admin-secondary-color)",
      accentColor: "var(--admin-accent-color)",
    },
  };

  const styles = roleStyles[role] || roleStyles.student; // Default to student if role is undefined

  return (
    <div
      style={{
        backgroundColor: styles.primaryColor,
        color: "var(--light-gray)",
        padding: "var(--spacing-md)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h2
        style={{
          color: styles.accentColor,
          fontSize: "var(--font-lg)",
          marginBottom: "var(--spacing-sm)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: styles.secondaryColor,
          fontSize: "var(--font-md)",
        }}
      >
        {description}
      </p>
    </div>
  );
};

export default VariableComponent;