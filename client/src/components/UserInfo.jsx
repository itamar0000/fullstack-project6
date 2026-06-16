import React from "react";

function UserInfo({ user }) {
  return (
    <dl className="info-grid">
      <div>
        <dt>Full name</dt>
        <dd>{user.name}</dd>
      </div>
      <div>
        <dt>Username</dt>
        <dd>{user.username}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd>{user.phone}</dd>
      </div>
      <div>
        <dt>Address</dt>
        <dd>
          {user.address?.street}, {user.address?.suite}, {user.address?.city}{" "}
          {user.address?.zipcode}
        </dd>
      </div>
      <div>
        <dt>Company</dt>
        <dd>{user.company?.name || "Not provided"}</dd>
      </div>
    </dl>
  );
}

export default UserInfo;
