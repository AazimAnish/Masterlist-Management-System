Masterlist Management System
============================

A **React-based web application** designed to revolutionize masterlist data management, offering automation, real-time validation, and a user-friendly interface. The application addresses the challenges of manual workflows, errors, and poor user experience in managing product-related master data.

* * * * *

🌟 Features
-----------

### 🚀 **Core Functionality**

-   **Automated Masterlist Management**

    -   Streamlined workflows with bulk data operations.
    -   CSV upload/download with template generation.
    -   Real-time data validation for error-free uploads.
    -   Detailed error reporting and rectification options.
-   **File Handling**

    -   Seamless CSV uploads and downloads.
    -   Error files for incorrect entries, with explanations for rectification.
    -   Support for bulk data upload and validation.
-   **Dynamic and Responsive UI**

    -   Intuitive navigation and actionable error messaging.
    -   Responsive design for all devices, enhancing usability.
    -   Real-time synchronization across tabs for seamless data flow.

* * * * *

### 📋 **Specific Modules**

#### **Item Master**

-   **Mandatory Fields**:
    -   `internal_item_name`
    -   `Type` (enum: sell/purchase/component)
    -   `UoM` (enum: kgs/nos)
    -   `Avg_weight_needed` (bool)
    -   `Scrap_type` (for `Type = sell`)
-   **System-Generated Fields**:
    -   `Created_by`, `Tenant_id`, `Id`, `createdAt`, `updatedAt`
-   **Key Validations**:
    -   Unique `internal_item_name + tenant` combination.
    -   Non-null `scrap_type` for `sell` items.
    -   `Min buffer` required for `sell` and `purchase` items.
    -   `Max buffer` >= `Min buffer`; defaults to 0 if NULL.

#### **Bill of Materials (BOM)**

-   **Mandatory Fields**:
    -   `Item ID`
    -   `Component ID`
    -   `Quantity` (1--100)
-   **System-Generated Fields**:
    -   `Id`, `Created_by`, `Last_updated_by`, `createdAt`, `updatedAt`
-   **Validation Constraints**:
    -   `Sell` items require at least one entry as `item_id`.
    -   `Purchase` items require at least one entry as `component_id`.
    -   `Component` items need both `item_id` and `component_id`.
    -   Unique `item_id + component_id` combinations.

* * * * *

🛠️ **Tech Stack**
------------------

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn](https://shadcn.dev/)

* * * * *

🎯 **Target Users**
-------------------

-   **Businesses & Enterprises**: Streamline their ERP processes and master data management with automated tools.
-   **Operations Teams**: Reduce manual errors and delays, ensuring real-time visibility and control over master data.
-   **Developers & IT Teams**: Simplify complex interdependencies and data integrations, with a system designed for easy customization and API support.

* * * * *

📉 **Market Gap**
-----------------

### **Why This Solution Matters**

The current market lacks a **centralized, real-time, and intuitive** solution for managing product-related master data. Businesses face:

-   High dependency on **manual processes** leading to delays and errors.
-   Lack of **real-time feedback** during data validation and uploads.
-   Over-reliance on **technical tools** like Postman, alienating non-technical users.
-   Poor handling of **interdependent processes**, causing bottlenecks in downstream operations.

This application bridges the gap by offering a **developer-friendly platform** with a user-centric design that caters to both **technical and non-technical stakeholders**.

* * * * *

💡 **Technical Insights**
----------------------------------

This project emphasizes a **modular architecture**, ensuring scalability and maintainability:

1.  **Real-Time State Management**: The application leverages advanced state management techniques to synchronize data seamlessly across tabs, ensuring a smooth user experience.
2.  **File Handling Mechanism**: CSV upload and download workflows include real-time validation, error segmentation, and actionable rectification feedback.
3.  **Validation Pipeline**: Built-in logic ensures data integrity with comprehensive error handling, highlighting only the incomplete or invalid records for correction.
4.  **Extensibility**: The codebase is designed with future integrations in mind---whether it's adding new APIs or customizing validation rules.
5.  **UI Optimization**: Leveraging shadcn's design components alongside Tailwind CSS ensures a consistent, responsive, and modern user interface.

* * * * *

📈 **Why Choose This System?**
------------------------------

-   **Efficiency**: Minimize manual intervention and accelerate workflows.
-   **Accuracy**: Real-time validation eliminates errors in masterlist entries.
-   **User-Centric Design**: Simplifies complex processes with intuitive navigation and clear messaging.
-   **Scalability**: Built with a developer-first mindset, ensuring easy adaptability to diverse business needs.

* * * * *
