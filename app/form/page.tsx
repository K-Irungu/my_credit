"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-hot-toast";
import SuccessModal from "../../components/SuccesModal";

interface Personnel {
  firstName: string;
  lastName: string;
  companyLocation: string;
  rolePosition: string;
  phoneNumber: string;
}

interface Malpractice {
  type: string;
  location: string;
  description: string;
  supportingFile: File | null;
  isOngoing: string;
}

interface Whistleblower {
  firstName: string;
  lastName: string;
  companyLocation: string;
  rolePosition: string;
  email: string;
  phoneNumber: string;
  requiresFeedback: string;
}

const initialPersonnel: Personnel = {
  firstName: "",
  lastName: "",
  companyLocation: "",
  rolePosition: "",
  phoneNumber: "",
};

const initialMalpractice: Malpractice = {
  type: "",
  location: "",
  description: "",
  supportingFile: null,
  isOngoing: "",
};

const initialWhistleblower: Whistleblower = {
  firstName: "",
  lastName: "",
  companyLocation: "",
  rolePosition: "",
  email: "",
  phoneNumber: "",
  requiresFeedback: "",
};

function MainForm() {
  const [personnel, setPersonnel] = useState<Personnel>(initialPersonnel);
  const [malpractice, setMalpractice] =
    useState<Malpractice>(initialMalpractice);
  const [whistleblower, setWhistleblower] =
    useState<Whistleblower>(initialWhistleblower);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const resetForm = () => {
    setPersonnel(initialPersonnel);
    setMalpractice(initialMalpractice);
    setWhistleblower(initialWhistleblower);
  };

  const handleChange =
    (setState: React.Dispatch<React.SetStateAction<any>>) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setState((prev: any) => ({ ...prev, [name]: value }));
    };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMalpractice((prev) => ({
        ...prev,
        supportingFile: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const browser = navigator.userAgent;

    const formData = new FormData();

    const malpracticeDataToSend = {
      type: malpractice.type,
      location: malpractice.location,
      description: malpractice.description,
      isOngoing: malpractice.isOngoing,
    };

    formData.append("personnel", JSON.stringify(personnel));
    formData.append("malpractice", JSON.stringify(malpracticeDataToSend));
    formData.append("whistleblower", JSON.stringify(whistleblower));
    formData.append("browser", browser);
    malpractice.supportingFile && formData.append("supportingFile", malpractice.supportingFile);

    try {
      const submitIssueEndpoint = "/api/reporter/submitIssue";

      const res = await fetch(submitIssueEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit");
      }

      toast.success("Submission sent successfully. Thank you.");
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message || "Failed to send submission. Please try again."
      );
    }
  };

  return (
    <div className="bg-[#fefadd] flex flex-col">
      <main className="container mx-auto px-4 py-5 flex-1 w-full max-w-7xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard
              title="Key Personnel Involved*"
              fields={[
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["companyLocation", "Company/Work Location"],
                ["rolePosition", "Role/Position"],
                ["phoneNumber", "Phone Number"],
              ]}
              values={personnel}
              onChange={handleChange(setPersonnel)}
              required
            />
            <MalpracticeCard
              values={malpractice}
              onChange={handleChange(setMalpractice)}
              onFileChange={handleFileChange}
            />
            <SectionCard
              title="Whistleblower Info (Optional)"
              fields={[
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["companyLocation", "Company/Work Location"],
                ["rolePosition", "Role/Position"],
                ["email", "Email"],
                ["phoneNumber", "Phone Number"],
              ]}
              values={whistleblower}
              onChange={handleChange(setWhistleblower)}
            >
              <RadioGroup
                label="Do you require feedback on the outcome?"
                name="requiresFeedback"
                options={["Yes", "No"]}
                selected={whistleblower.requiresFeedback}
                onChange={handleChange(setWhistleblower)}
              />
            </SectionCard>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="cursor-pointer hover:bg-[#58595d] hover:text-[#ffde17] w-full sm:w-auto text-center sm:text-left inline-block bg-[#ffde17] text-gray-900 font-semibold text-sm px-6 py-3 rounded-md shadow-md transition duration-300"
            >
              Submit Report
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  fields: [string, string][];
  values: Record<string, any>;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  children?: React.ReactNode;
}

function SectionCard({
  title,
  fields,
  values,
  onChange,
  required,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <h2 className="text-md font-semibold text-gray-800 mb-4">{title}</h2>
      {fields.map(([name, label]) => (
        <div key={name}>
          <label
            htmlFor={name}
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
          <input
            type={name === "email" ? "email" : "text"}
            name={name}
            id={name}
            value={values[name] || ""}
            onChange={onChange}
            className="bg-yellow-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            required={required}
          />
        </div>
      ))}
      {children}
    </div>
  );
}

interface MalpracticeCardProps {
  values: Malpractice;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function MalpracticeCard({
  values,
  onChange,
  onFileChange,
}: MalpracticeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <h2 className="text-md font-semibold text-gray-800">
        Malpractice Details*
      </h2>

      <div>
        <label className="block mb-1 text-xs font-medium text-gray-900">
          Type of Malpractice
        </label>
        <select
          name="type"
          value={values.type}
          onChange={onChange}
          className="cursor-pointer bg-yellow-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
          required
        >
          <option value="">Select malpractice</option>
          <option value="fraud">Fraud</option>
          <option value="corruption">Corruption</option>
          <option value="harassment">Harassment</option>
          <option value="theft">Theft</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={values.location}
          onChange={onChange}
          className="bg-yellow-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description*
        </label>
        <textarea
          name="description"
          rows={4}
          value={values.description}
          onChange={onChange}
          className="bg-yellow-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
          required
        ></textarea>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Attach Supporting File
        </label>
        <input
          type="file"
          name="supportingFile"
          onChange={onFileChange}
          className="block w-full text-xs p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-yellow-50 focus:outline-none"
        />
      </div>

      <RadioGroup
        label="Is the malpractice ongoing?"
        name="isOngoing"
        options={["Yes", "No", "Unknown"]}
        selected={values.isOngoing}
        onChange={onChange}
        required
      />
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: string[];
  selected: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function RadioGroup({
  label,
  name,
  options,
  selected,
  onChange,
  required,
}: RadioGroupProps) {
  return (
    <div className="pt-2">
      <p className="block text-xs font-medium text-gray-700 mb-2">{label}</p>
      {options.map((option) => (
        <div key={option} className="flex items-center mb-2 cursor-pointer">
          <input
            id={`${name}-${option.toLowerCase()}`}
            type="radio"
            name={name}
            value={option}
            checked={selected === option}
            onChange={onChange}
            required={required}
            className="cursor-pointer w-3 h-3 text-yellow-600 bg-white border-gray-300 focus:ring-yellow-500"
          />
          <label
            htmlFor={`${name}-${option.toLowerCase()}`}
            className="cursor-pointer ml-2 text-xs font-medium text-gray-900"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}

function App() {
  return <MainForm />;
}

export default App;
