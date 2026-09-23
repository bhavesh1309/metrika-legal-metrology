import React, { useMemo, useState } from "react";
import {
  Database,
  Plus,
  Search,
  Pencil,
  Power,
  CheckCircle2,
  XCircle,
  Scale,
  FileText,
  UserCog,
  MapPin,
} from "lucide-react";

const initialData = {
  instrumentTypes: [
    { id: 1, name: "Weighing Scale", status: "ACTIVE" },
    { id: 2, name: "Carat Weights", status: "ACTIVE" },
    { id: 3, name: "Fuel Dispenser", status: "ACTIVE" },
    { id: 4, name: "Measuring Vessel", status: "ACTIVE" },
    { id: 5, name: "Platform Scale", status: "ACTIVE" },
    { id: 6, name: "Electronic Balance", status: "ACTIVE" },
  ],

  applicationTypes: [
    { id: 1, name: "Verification", status: "ACTIVE" },
    { id: 2, name: "Re-verification", status: "ACTIVE" },
  ],

  specializations: [
    { id: 1, name: "Weighing Instruments", status: "ACTIVE" },
    { id: 2, name: "Measuring Instruments", status: "ACTIVE" },
    { id: 3, name: "Fuel Dispensers", status: "ACTIVE" },
    { id: 4, name: "Weights", status: "ACTIVE" },
    { id: 5, name: "Commercial Measuring Equipment", status: "ACTIVE" },
  ],

  districts: [
    { id: 1, name: "Nainital", status: "ACTIVE" },
    { id: 2, name: "Haldwani", status: "ACTIVE" },
    { id: 3, name: "Almora", status: "ACTIVE" },
    { id: 4, name: "Dehradun", status: "ACTIVE" },
    { id: 5, name: "Haridwar", status: "ACTIVE" },
    { id: 6, name: "Udham Singh Nagar", status: "ACTIVE" },
  ],
};

export default function AdminMasterDataPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(
    "instrumentTypes"
  );

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");

  const tabs = [
    {
      key: "instrumentTypes",
      label: "Instrument Types",
      icon: Scale,
    },
    {
      key: "applicationTypes",
      label: "Application Types",
      icon: FileText,
    },
    {
      key: "specializations",
      label: "Officer Specializations",
      icon: UserCog,
    },
    {
      key: "districts",
      label: "Districts",
      icon: MapPin,
    },
  ];

  const currentItems = data[activeTab] || [];

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [currentItems, search]);

  const activeCount = currentItems.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const inactiveCount = currentItems.filter(
    (item) => item.status === "INACTIVE"
  ).length;

  const openAddModal = () => {
    setEditingItem(null);
    setItemName("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setShowModal(true);
  };

  const saveItem = () => {
    const trimmedName = itemName.trim();

    if (!trimmedName) {
      return;
    }

    setData((previous) => {
      const updated = {
        ...previous,
      };

      if (editingItem) {
        updated[activeTab] = updated[activeTab].map(
          (item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  name: trimmedName,
                }
              : item
        );
      } else {
        const newId =
          Math.max(
            ...updated[activeTab].map(
              (item) => item.id
            ),
            0
          ) + 1;

        updated[activeTab] = [
          ...updated[activeTab],
          {
            id: newId,
            name: trimmedName,
            status: "ACTIVE",
          },
        ];
      }

      return updated;
    });

    setShowModal(false);
    setEditingItem(null);
    setItemName("");
  };

  const toggleStatus = (id) => {
    setData((previous) => ({
      ...previous,
      [activeTab]: previous[activeTab].map(
        (item) =>
          item.id === id
            ? {
                ...item,
                status:
                  item.status === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE",
              }
            : item
      ),
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#f5f9fd] p-6 md:p-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <Database
              size={25}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Master Data
            </h1>

            <p className="text-gray-500 mt-1">
              Manage reference data used across Metrika.
            </p>
          </div>

        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add New
        </button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">

        <SummaryCard
          title="Total Records"
          value={currentItems.length}
          icon={Database}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <SummaryCard
          title="Active"
          value={activeCount}
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />

        <SummaryCard
          title="Inactive"
          value={inactiveCount}
          icon={XCircle}
          iconBg="bg-gray-100"
          iconColor="text-gray-500"
        />

      </div>

      {/* =====================================================
          TABS
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">

        <div className="flex overflow-x-auto border-b border-gray-200">

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() =>
                  handleTabChange(tab.key)
                }
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}

        </div>

        {/* ===================================================
            SEARCH
        ==================================================== */}

        <div className="p-5">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={`Search ${tabs
                .find(
                  (tab) =>
                    tab.key === activeTab
                )
                ?.label.toLowerCase()}...`}
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          DATA TABLE
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100">

          <h2 className="text-lg font-semibold text-gray-900">
            {tabs.find(
              (tab) =>
                tab.key === activeTab
            )?.label}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredItems.length} records found
          </p>

        </div>

        {filteredItems.length === 0 ? (

          <div className="py-16 text-center">

            <Database
              size={42}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 font-semibold text-gray-800">
              No records found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Try changing your search or add a new record.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    ID
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Name
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredItems.map((item) => (

                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-4 text-sm text-gray-500">
                      #{item.id}
                    </td>

                    <td className="px-6 py-4">

                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      {item.status === "ACTIVE" ? (

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">

                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

                          Active

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">

                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />

                          Inactive

                        </span>

                      )}

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(item.id)
                          }
                          className={`p-2 rounded-lg transition ${
                            item.status === "ACTIVE"
                              ? "text-gray-500 hover:bg-red-50 hover:text-red-600"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            item.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <Power size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          MODAL
      ====================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            <div className="p-6 border-b border-gray-100">

              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem
                  ? "Edit Record"
                  : "Add New Record"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {editingItem
                  ? "Update this master data entry."
                  : "Add a new master data entry."}
              </p>

            </div>

            <div className="p-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>

              <input
                autoFocus
                type="text"
                value={itemName}
                onChange={(event) =>
                  setItemName(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    saveItem();
                  }
                }}
                placeholder="Enter name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
              >
                Cancel
              </button>

              <button
                onClick={saveItem}
                disabled={!itemName.trim()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem
                  ? "Save Changes"
                  : "Add Record"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>

        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
        >

          <Icon
            size={23}
            className={iconColor}
          />

        </div>

      </div>

    </div>
  );
}