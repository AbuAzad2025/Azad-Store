import React from "react";
import { useLanguage } from "@/context/language-context";

function SingleNav({ active = false, id, title, icon }) {
  return (
    <button
      className={`nav-link ${active ? "active" : ""}`}
      id={`nav-${id}-tab`}
      data-bs-toggle="tab"
      data-bs-target={`#nav-${id}`}
      type="button"
      role="tab"
      aria-controls={id}
      aria-selected={active ? "true" : "false"}
    >
      <span>
        <i className={icon}></i>
      </span>
      {title}
    </button>
  );
}

const ProfileNavTab = () => {
  const { t } = useLanguage();
  return (
    <nav>
      <div
        className="nav nav-tabs tp-tab-menu flex-column"
        id="profile-tab"
        role="tablist"
      >
        <SingleNav
          active={true}
          id="profile"
          title={t("myProfile")}
          icon="fa-regular fa-user-pen"
        />
        <SingleNav
          id="information"
          title={t("info")}
          icon="fa-regular fa-circle-info"
        />
        <SingleNav
          id="order"
          title={t("orderHistory")}
          icon="fa-regular fa-clipboard-list-check"
        />
        <SingleNav
          id="password"
          title={t("changePassword")}
          icon="fa-regular fa-lock"
        />
      </div>
    </nav>
  );
};

export default ProfileNavTab;
