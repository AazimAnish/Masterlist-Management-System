# Masterlist Management System

A modern React-based web application designed to streamline master data management with comprehensive features for handling item masters, bill of materials (BOM), processes, and process steps.

## 🌟 Overview

The Masterlist Management System is a powerful tool designed to revolutionize masterlist data management, offering automation, real-time validation, and a user-friendly interface. The application addresses the challenges of manual workflows, errors, and poor user experience in managing product-related master data.

## ✨ Core Features

### 🚀 Item Master Management

- **Create, Edit, and Delete Items** with comprehensive form validation
- **Item Types**: Support for sell, purchase, and component items
- **Key Validations**:
  - Unique internal_item_name + tenant combination
  - Scrap type required for sell items
  - Min buffer required for sell and purchase items
  - Max buffer >= Min buffer; defaults to 0 if NULL
- **Mandatory Fields**:
  - internal_item_name
  - Type (enum: sell/purchase/component)
  - UoM (enum: kgs/nos)
  - Avg_weight_needed (bool)
  - Scrap_type (for Type = sell)
- **System-Generated Fields**:
  - Created_by, Tenant_id, Id, createdAt, updatedAt

### 📋 Bill of Materials (BOM) Management

- **Define component relationships** with quantities
- **Validate** BOM entries for data integrity
- **Mandatory Fields**:
  - Item ID
  - Component ID
  - Quantity (1-100)
- **System-Generated Fields**:
  - Id, Created_by, Last_updated_by, createdAt, updatedAt
- **Validation Constraints**:
  - Sell items require at least one entry as item_id
  - Purchase items require at least one entry as component_id
  - Component items need both item_id and component_id
  - Unique item_id + component_id combinations

### ⚙️ Process Management

- Create and manage manufacturing processes
- Associate processes with work centers
- Track process dependencies and flow

### 📝 Process Steps Management

- Break down processes into detailed steps
- Define step sequences and dependencies
- Track process step execution status

### 📤 CSV Import/Export

- **CSV Template Generation** for Items and BOM
- **Bulk Data Operations** with real-time validation
- **Error Reporting** with detailed validation feedback
- **Error File Generation** for failed records with clear explanations

### 📊 Dashboard and Reporting

- Quick overview of masterlist data status
- Setup progress tracking
- Statistical overview of items, BOMs, processes, and steps

## 🛠️ Technical Architecture

### Frontend Framework

- **Next.js 15.0.3**: Server-side rendering and static site generation
- **React 19**: Latest React features for optimal performance
- **TypeScript**: Type-safe code development

### UI Components

- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Accessible component system built on Radix UI
- **Lucide React**: Icon library for visual elements

### State Management

- **Zustand**: Lightweight state management solution
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation library

### Data Processing

- **PapaParse**: CSV parsing and manipulation
- **xlsx-js-style**: Excel file generation with styling

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/                # API routes
│   ├── bom/                # BOM pages
│   ├── items/              # Item pages
│   ├── processes/          # Process pages
│   ├── process-steps/      # Process step pages
│   └── page.tsx            # Home/Dashboard page
│
├── components/             # React components
│   ├── features/           # Feature-specific components
│   │   ├── bom/            # BOM components
│   │   ├── csv/            # CSV handling components
│   │   ├── home/           # Dashboard components
│   │   ├── items/          # Item management components
│   │   ├── processes/      # Process management components
│   │   └── process-steps/  # Process steps components
│   ├── layout/             # Layout components
│   ├── navigation/         # Navigation components
│   └── ui/                 # UI components (shadcn)
│
├── config/                 # Configuration files
│   └── navigation.ts       # Navigation configuration
│
├── constants/              # Application constants
│
├── data/                   # Mock data and data utilities
│
├── hooks/                  # Custom React hooks
│
├── lib/                    # Utility libraries
│
├── services/               # Service layer
│   ├── api/                # API services
│   ├── csv-validation.service.ts  # CSV validation logic
│   └── bom-csv-validation.service.ts  # BOM CSV validation
│
├── stores/                 # Zustand state stores
│
├── types/                  # TypeScript type definitions
│   ├── bom.ts              # BOM types
│   ├── csv.ts              # CSV handling types
│   ├── item.ts             # Item types
│   ├── process.ts          # Process types
│   └── process-step.ts     # Process step types
│
├── utils/                  # Utility functions
│
└── validations/            # Schema validations
    ├── bom.schema.ts       # BOM validation schema
    ├── item.schema.ts      # Item validation schema
    ├── process.schema.ts   # Process validation schema
    └── process-step.schema.ts  # Process step validation schema
```

## 🔄 Data Models

### Item Model

```typescript
export interface Item {
  id: string;
  internal_item_name: string;
  type: 'sell' | 'purchase' | 'component';
  uom: 'kgs' | 'nos';
  item_description?: string;
  tenant_id: number;
  created_by: string;
  last_updated_by: string;
  is_deleted: boolean;
  customer_item_name?: string;
  max_buffer?: number;
  min_buffer?: number;
  createdAt: string;
  updatedAt: string;
  components?: Item[];
  usedIn?: Item[];
  additional_attributes: {
    drawing_revision_number?: number;
    drawing_revision_date?: string;
    avg_weight_needed: boolean;
    scrap_type?: string;
    shelf_floor_alternate_name?: string;
  };
}
```

### BOM Model

```typescript
export interface BOMEntry {
  id?: string;
  item_id: string;
  component_id: string;
  quantity: number;
  uom: string;
  scrap_percentage?: number;
  notes?: string;
  is_active: boolean;
  created_by: string;
  last_updated_by: string;
  createdAt: string;
  updatedAt: string;
}
```

## 📊 CSV Handling

The system provides robust CSV handling capabilities:

1. **Template Generation**:
   - Automatically generate templates for Items and BOM for bulk uploads
   - Includes all required fields with example values

2. **Validation Pipeline**:
   - Real-time validation with clear error messaging
   - Row-by-row validation with detailed error reports
   - Error segregation for easy troubleshooting

3. **Error Reporting**:
   - Downloadable error reports for failed records
   - Clear explanations of validation failures
   - Data preservation for easy correction and re-upload

## 🎨 UI/UX Features

- **Responsive Design**: Fully responsive interface that works on all device sizes
- **Intuitive Navigation**: Simple and clear navigation with logical grouping
- **Actionable Error Messages**: Clear guidance on resolving validation issues
- **Progress Tracking**: Visual indicators of setup completion status
- **Real-time Feedback**: Immediate feedback on user actions
- **Data Tables**: Sortable, filterable tables for data management
- **Form Validation**: Real-time validation with clear error indicators
- **Interactive Dashboards**: Visual representation of system data

## 🔒 Data Validation

The system implements comprehensive validation rules:

1. **Item Validation**:
   - Mandatory fields checking
   - Type-specific validations
   - Buffer limits validation
   - Unique constraint enforcement

2. **BOM Validation**:
   - Quantity range validation (1-100)
   - Relationship integrity checks
   - Duplicate entry prevention
   - Component compatibility verification

## 📱 Cross-Tab Synchronization

- Real-time data synchronization across browser tabs
- State consistency across multiple sessions
- Zustand-powered state persistence

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/masterlist-management-system.git

# Navigate to the project directory
cd masterlist-management-system

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Start the production server
npm start
# or
yarn start
```

## 🙌 Target Users

- **Businesses & Enterprises**: Streamline ERP processes and master data management
- **Operations Teams**: Reduce manual errors and delays
- **Developers & IT Teams**: Simplify complex interdependencies and data integrations

## 💡 Key Benefits

- **Efficiency**: Streamlined workflows with automation
- **Accuracy**: Real-time validation for error prevention
- **Usability**: Intuitive interface for technical and non-technical users
- **Scalability**: Modular architecture for easy extension
- **Integration**: API-first design for system integration

## 🔄 Continuous Improvement

The Masterlist Management System is continuously evolving with:

- New feature development based on user feedback
- Performance optimizations for handling larger datasets
- Enhanced validation rules for specific business needs
- Extended API capabilities for system integration

## 📈 Why This Solution Matters

The current market lacks a centralized, real-time, and intuitive solution for managing product-related master data. This application bridges that gap by offering a developer-friendly platform with a user-centric design that caters to both technical and non-technical stakeholders.
