// import React, { useState, useEffect, useContext } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import { Tabs, Collapse, Avatar } from "antd";
// import { MdAddCircle } from "react-icons/md";
// import "./Profile.css";
// import NewFolderPopUp from "../NewFolderPopUp/NewFolderPopUp";
// import ProfileBuildCard from "../ProfileBuildCard/ProfileBuildCard";
// import TabContent from "../ProfileTabContent/ProfileTabContent";
// import EditProfilePopUp from "../EditProfilePopUp/EditProfilePopUp";
// import { UserOutlined } from "@ant-design/icons";
// import { SavedComponentsContext } from "../../Context/SavedComponentContext";

// // function Profile() {

// //   const [activeTab, setActiveTab] = useState(initialTab);
// //   const [openPopUp, setOpenPopUp] = useState(false);
// //   const [openEditProfilePopUp, setOpenEditProfilePopUp] = useState(false);
// //   const [imageUrl, setImageUrl] = useState("");
// //   const [userBio, setUserBio] = useState("Available");
// //   const [userName, setUserName] = useState("User Name");

// function Profile() {
//     const navigate = useNavigate();
//   const location = useLocation();

//   const queryParams = new URLSearchParams(location.search);
//   const initialTab = queryParams.get("tab") || "1";
//   const [activeTab, setActiveTab] = useState("1");
//   const [openPopUp, setOpenPopUp] = useState(false);
//   const [openEditProfilePopUp, setOpenEditProfilePopUp] = useState(false);
//   const [imageUrl, setImageUrl] = useState("");
//   const [userBio, setUserBio] = useState("Available");
//   const [userName, setUserName] = useState("User Name");

//   // Completed builds state
//   const [completedBuilds, setCompletedBuilds] = useState([]);
//   const [loadingBuilds, setLoadingBuilds] = useState(false);

//   const [folders, setFolders] = useState({
//     1: [
//       {
//         name: "Gaming",
//         profileBuilds: [{ id: 1, title: "High-End Gaming PC" }],
//       },
//       {
//         name: "Streaming Rig",
//         profileBuilds: [{ id: 2, title: "Streaming Beast" }],
//       },
//     ],
//     2: [
//       {
//         name: "Workstation Build",
//         profileBuilds: [{ id: 3, title: "Video Editing Setup" }],
//       },
//       {
//         name: "Budget Gaming",
//         profileBuilds: [{ id: 4, title: "Affordable Gaming" }],
//       },
//     ],
//     3: [
//       { name: "all", profileBuilds: [] },
//       { name: "cpu", profileBuilds: [] },
//       { name: "gpu", profileBuilds: [] },
//       { name: "motherboard", profileBuilds: [] },
//       { name: "ram", profileBuilds: [] },
//       { name: "case", profileBuilds: [] },
//       { name: "storage", profileBuilds: [] },
//       { name: "cooling", profileBuilds: [] },
//       { name: "power supply", profileBuilds: [] },
//     ],
//   });

//   const { savedComponents } = useContext(SavedComponentsContext);
//   useEffect(() => {
//     const fetchCompletedBuilds = async () => {
//       setLoadingBuilds(true);
//       try {
//         const { data } = await axios.get(
//           "http://localhost:4000/api/build/user/completed",
//           { withCredentials: true }
//         );
//         setCompletedBuilds(data.builds || []);
//       } catch (err) {
//         setCompletedBuilds([]);
//       } finally {
//         setLoadingBuilds(false);
//       }
//     };
//     fetchCompletedBuilds();
//   }, []);
//   useEffect(() => {
//     const newTab = queryParams.get("tab") || "1";
//     if (newTab !== activeTab) {
//       setActiveTab(newTab);
//     }
//   }, [location.search]);

//   useEffect(() => {
//     if (!savedComponents || typeof savedComponents !== "object") {
//       return;
//     }

//     setFolders((prev) => {
//       const updatedFolders = { ...prev };
//       let hasChanged = false;

//       updatedFolders[3] = updatedFolders[3].map((folder) => {
//         const folderKey = folder.name.toLowerCase();
//         const componentsForFolder = savedComponents[folderKey];

//         if (
//           componentsForFolder &&
//           JSON.stringify(componentsForFolder) !==
//             JSON.stringify(folder.profileBuilds)
//         ) {
//           hasChanged = true;
//           return { ...folder, profileBuilds: componentsForFolder };
//         }
//         return folder;
//       });

//       return hasChanged ? updatedFolders : prev;
//     });
//   }, [savedComponents]);

//   const handleDeleteFolder = (folderIndex) => {
//     setFolders((prev) => {
//       const updatedFolders = {
//         ...prev,
//         [activeTab]: prev[activeTab].filter(
//           (_, index) => index !== folderIndex
//         ),
//       };
//       return updatedFolders;
//     });
//   };

//   const handleSaveFolder = (folderName) => {
//     if (!folderName.trim()) return;
//     setFolders((prev) => ({
//       ...prev,
//       [activeTab]: [
//         ...(prev[activeTab] ?? []),
//         { name: folderName, profileBuilds: [] },
//       ],
//     }));
//     setTimeout(() => setOpenPopUp(false), 0);
//   };

//   return (
//     <div className="profile_main">
//       <div className="profile_primary">
//         <div className="profile_image">
//           {imageUrl ? (
//             <img src={imageUrl} size={100} />
//           ) : (
//             <UserOutlined className="default-avatar-icon" />
//           )}
//         </div>
//         <div className="profile_userDetails">
//           <div className="profie_user_info">
//             <p className="profile_username"> {userName} </p>
//             <p className="profile_followerCount">
//               180 <span style={{ color: "#7d7e80" }}>followers</span>
//             </p>
//           </div>
//         </div>
//         <div className="profile_userBio">{userBio ? <p>{userBio}</p> : ""}</div>
//         <div className="profile_editbtn">
//           <button onClick={() => setOpenEditProfilePopUp(true)}>
//             Edit Profile
//           </button>
//         </div>
//       </div>

//       <div className="profile_secondary">
//         <Tabs
//           centered
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           items={[
//             {
//               label: "Completed Builds",
//               key: "1",
//               children: (
//                 <div>
//                   {loadingBuilds ? (
//                     <div>Loading builds...</div>
//                   ) : completedBuilds.length === 0 ? (
//                     <div>No completed builds yet.</div>
//                   ) : (
//                     completedBuilds.map((build) => (
//                       <ProfileBuildCard
//                         key={build._id}
//                         buildTitle={build.title}
//                         buildImage={
//                           build.components.cpu?.image_source ||
//                           build.components.gpu?.image_source ||
//                           build.components.motherboard?.image_source ||
//                           build.components.case?.image_source ||
//                           build.components.memory?.image_source ||
//                           build.components.storage?.image_source ||
//                           build.components.psu?.image_source ||
//                           build.components.cooler?.image_source ||
//                           "default_image_url"
//                         } // Add more props as needed
//                       />
//                     ))
//                   )}
//                 </div>
//               ),
//             },
//             {
//               label: "Saved Builds",
//               key: "2",
//               children: (
//                 <TabContent
//                   tabKey="2"
//                   folders={folders}
//                   setFolders={setFolders}
//                   handleDeleteFolder={handleDeleteFolder}
//                   setOpenPopUp={setOpenPopUp}
//                 />
//               ),
//             },
//             {
//               label: "Saved Components",
//               key: "3",
//               children: (
//                 <TabContent
//                   tabKey="3"
//                   folders={folders}
//                   setFolders={setFolders}
//                   handleDeleteFolder={handleDeleteFolder}
//                   setOpenPopUp={setOpenPopUp}
//                 />
//               ),
//             },
//           ]}
//         />
//       </div>

//       {openPopUp && (
//         <NewFolderPopUp
//           setOpenPopUp={setOpenPopUp}
//           handleSaveFolder={handleSaveFolder}
//         />
//       )}
//       {openEditProfilePopUp && (
//         <EditProfilePopUp
//           setOpenEditProfilePopUp={setOpenEditProfilePopUp}
//           setImageUrl={setImageUrl}
//           imageUrl={imageUrl}
//           setUserBio={setUserBio}
//           userBio={userBio}
//           setUserName={setUserName}
//           userName={userName}
//         />
//       )}
//     </div>
//   );
// }

// export default Profile;
// import React, { useState, useEffect, useContext } from "react";
// import { Tabs } from "antd";
// import { UserOutlined } from "@ant-design/icons";
// import axios from "axios";
// import ProfileBuildCard from "../ProfileBuildCard/ProfileBuildCard";
// import TabContent from "../ProfileTabContent/ProfileTabContent";
// import NewFolderPopUp from "../NewFolderPopUp/NewFolderPopUp";
// import EditProfilePopUp from "../EditProfilePopUp/EditProfilePopUp";
// import { SavedComponentsContext } from "../../Context/SavedComponentContext";
// import { UserContext } from "../../Context/UserContext"; // Adjust path as needed

// import "./Profile.css";

// function Profile() {
//   const [activeTab, setActiveTab] = useState("1");
//   const [openPopUp, setOpenPopUp] = useState(false);
//   const [openEditProfilePopUp, setOpenEditProfilePopUp] = useState(false);
//   const [imageUrl, setImageUrl] = useState("");
//   const [userBio, setUserBio] = useState("Available");
//   const [userName, setUserName] = useState("User Name");

//   // Folders for all tabs
//   const [folders, setFolders] = useState({
//     1: [
//       {
//         name: "Completed Builds",
//         profileBuilds: [],
//       },
//     ],
//     2: [
//       {
//         name: "Workstation Build",
//         profileBuilds: [{ id: 3, title: "Video Editing Setup" }],
//       },
//       {
//         name: "Budget Gaming",
//         profileBuilds: [{ id: 4, title: "Affordable Gaming" }],
//       },
//     ],
//     3: [
//       { name: "all", profileBuilds: [] },
//       { name: "cpu", profileBuilds: [] },
//       { name: "gpu", profileBuilds: [] },
//       { name: "motherboard", profileBuilds: [] },
//       { name: "ram", profileBuilds: [] },
//       { name: "case", profileBuilds: [] },
//       { name: "storage", profileBuilds: [] },
//       { name: "cooler", profileBuilds: [] },
//       { name: "power supply", profileBuilds: [] },
//     ],
//   });

//   const [loadingBuilds, setLoadingBuilds] = useState(false);
//   const { user } = useContext(UserContext);

//   const { savedComponents } = useContext(SavedComponentsContext);
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const { data } = await axios.get(
//           `http://localhost:4000/api/users/${user.username}`,
//           {
//             withCredentials: true,
//           }
//         );
//         console.log("User data:", data.user);
//         const { username, bio, image } = data.user;

//         setUserName(username || "User Name");
//         setUserBio(bio || "Available");
//         setImageUrl(image || "");
//         console.log("User data:", data.user);
//       } catch (error) {
//         console.error("Error fetching user profile:", error);
//       }
//     };

//     if (user) {
//       fetchUserProfile();
//     }
//   }, [user]);

//   // Fetch completed builds and update folders[1][0].profileBuilds
//   useEffect(() => {
//     const fetchCompletedBuilds = async () => {
//       setLoadingBuilds(true);
//       try {
//         const { data } = await axios.get(
//           "http://localhost:4000/api/build/user/completed",
//           { withCredentials: true }
//         );
//         setFolders((prev) => {
//           const updated = { ...prev };
//           updated[1] = [
//             {
//               ...updated[1][0],
//               profileBuilds: (data.builds || []).map((build) => ({
//                 ...build, // <-- store the full build object!
//                 image_source:
//                   build.components.cpu?.image_source ||
//                   build.components.gpu?.image_source ||
//                   build.components.motherboard?.image_source ||
//                   build.components.case?.image_source ||
//                   build.components.memory?.image_source ||
//                   build.components.storage?.image_source ||
//                   build.components.psu?.image_source ||
//                   build.components.cooler?.image_source ||
//                   null,
//               })),
//             },
//           ];
//           return updated;
//         });
//       } catch (err) {
//         setFolders((prev) => {
//           const updated = { ...prev };
//           updated[1][0].profileBuilds = [];
//           return updated;
//         });
//       } finally {
//         setLoadingBuilds(false);
//       }
//     };
//     fetchCompletedBuilds();
//   }, []);

//   // Update folders for saved components
//   useEffect(() => {
//     if (!savedComponents || typeof savedComponents !== "object") {
//       return;
//     }
//     setFolders((prev) => {
//       const updatedFolders = { ...prev };
//       let hasChanged = false;
//       updatedFolders[3] = updatedFolders[3].map((folder) => {
//         const folderKey = folder.name.toLowerCase();
//         const componentsForFolder = savedComponents[folderKey];
//         if (
//           componentsForFolder &&
//           JSON.stringify(componentsForFolder) !==
//             JSON.stringify(folder.profileBuilds)
//         ) {
//           hasChanged = true;
//           return { ...folder, profileBuilds: componentsForFolder };
//         }
//         return folder;
//       });
//       return hasChanged ? updatedFolders : prev;
//     });
//   }, [savedComponents]);

//   const handleDeleteFolder = (folderIndex) => {
//     setFolders((prev) => {
//       const updatedFolders = {
//         ...prev,
//         [activeTab]: prev[activeTab].filter(
//           (_, index) => index !== folderIndex
//         ),
//       };
//       return updatedFolders;
//     });
//   };

//   const handleSaveFolder = (folderName) => {
//     if (!folderName.trim()) return;
//     setFolders((prev) => ({
//       ...prev,
//       [activeTab]: [
//         ...(prev[activeTab] ?? []),
//         { name: folderName, profileBuilds: [] },
//       ],
//     }));
//     setTimeout(() => setOpenPopUp(false), 0);
//   };

//   return (
//     <div className="profile_main">
//       <div className="profile_primary">
//         <div className="profile_image">
//           {imageUrl ? (
//             <img src={imageUrl} size={100} alt="Profile" />
//           ) : (
//             <UserOutlined className="default-avatar-icon" />
//           )}
//         </div>
//         <div className="profile_userDetails">
//           <div className="profie_user_info">
//             <p className="profile_username"> {userName} </p>
//             <p className="profile_followerCount">
//               180 <span style={{ color: "#7d7e80" }}>followers</span>
//             </p>
//           </div>
//         </div>
//         <div className="profile_userBio">{userBio ? <p>{userBio}</p> : ""}</div>
//         <div className="profile_editbtn">
//           <button onClick={() => setOpenEditProfilePopUp(true)}>
//             Edit Profile
//           </button>
//         </div>
//       </div>

//       <div className="profile_secondary">
//         <Tabs
//           centered
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           items={[
//             {
//               label: "Completed Builds",
//               key: "1",
//               children: (
//                 <TabContent
//                   tabKey="1"
//                   folders={folders}
//                   setFolders={setFolders}
//                   handleDeleteFolder={handleDeleteFolder}
//                   setOpenPopUp={setOpenPopUp}
//                   loading={loadingBuilds}
//                 />
//               ),
//             },
//             {
//               label: "Saved Builds",
//               key: "2",
//               children: (
//                 <TabContent
//                   tabKey="2"
//                   folders={folders}
//                   setFolders={setFolders}
//                   handleDeleteFolder={handleDeleteFolder}
//                   setOpenPopUp={setOpenPopUp}
//                 />
//               ),
//             },
//             {
//               label: "Saved Components",
//               key: "3",
//               children: (
//                 <TabContent
//                   tabKey="3"
//                   folders={folders}
//                   setFolders={setFolders}
//                   handleDeleteFolder={handleDeleteFolder}
//                   setOpenPopUp={setOpenPopUp}
//                 />
//               ),
//             },
//           ]}
//         />
//       </div>

//       {openPopUp && (
//         <NewFolderPopUp
//           setOpenPopUp={setOpenPopUp}
//           handleSaveFolder={handleSaveFolder}
//         />
//       )}
//       {openEditProfilePopUp && (
//         <EditProfilePopUp
//           setOpenEditProfilePopUp={setOpenEditProfilePopUp}
//           setImageUrl={setImageUrl}
//           imageUrl={imageUrl}
//           setUserBio={setUserBio}
//           userBio={userBio}
//           setUserName={setUserName}
//           userName={userName}
//         />
//       )}
//     </div>
//   );
// }

// export default Profile;
import React, { useState, useEffect, useContext } from "react";
import { Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import ProfileBuildCard from "./ProfileBuildCard";
import TabContent from "./ProfileTabContent";
import NewFolderPopUp from "./NewFolderPopUp";
import EditProfilePopUp from "./EditProfilePopUp";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import { UserContext } from "../../Context/UserContext";

import "./Profile.css";

function Profile() {
  const [activeTab, setActiveTab] = useState("1");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [openEditProfilePopUp, setOpenEditProfilePopUp] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [userBio, setUserBio] = useState("Available");
  const [userName, setUserName] = useState("User Name");

  // Folders for all tabs
  const [folders, setFolders] = useState({
    1: [
      {
        name: "Completed Builds",
        profileBuilds: [],
      },
    ],
    2: [
      {
        name: "Workstation Build",
        profileBuilds: [{ id: 3, title: "Video Editing Setup" }],
      },
      {
        name: "Budget Gaming",
        profileBuilds: [{ id: 4, title: "Affordable Gaming" }],
      },
    ],
    3: [
      { name: "all", profileBuilds: [] },
      { name: "cpu", profileBuilds: [] },
      { name: "gpu", profileBuilds: [] },
      { name: "motherboard", profileBuilds: [] },
      { name: "ram", profileBuilds: [] },
      { name: "case", profileBuilds: [] },
      { name: "storage", profileBuilds: [] },
      { name: "cooler", profileBuilds: [] },
      { name: "power supply", profileBuilds: [] },
    ],
  });

  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const { user } = useContext(UserContext);

  const { savedComponents } = useContext(SavedComponentsContext);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Ensure user exists before trying to access username
        if (!user || !user.username) {
          console.log("User or username is undefined");
          return;
        }

        const { data } = await axios.get(
          `http://localhost:4000/api/users/${user.username}`,
          {
            withCredentials: true,
          }
        );

        // Check if we have a successful response with profile data
        if (data.success && data.profile) {
          console.log("User profile data:", data.profile);
          const { username, bio, avatar } = data.profile;

          setUserName(username || "User Name");
          setUserBio(bio || "Available");
          setImageUrl(avatar || "");
        } else {
          console.error("Invalid profile data structure:", data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Fetch completed builds and update folders[1][0].profileBuilds
  useEffect(() => {
    const fetchCompletedBuilds = async () => {
      if (!user) {
        console.log("User not authenticated, skipping build fetch");
        return;
      }

      setLoadingBuilds(true);
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/build/user/completed",
          { withCredentials: true }
        );
        setFolders((prev) => {
          const updated = { ...prev };
          updated[1] = [
            {
              ...updated[1][0],
              profileBuilds: (data.builds || []).map((build) => ({
                ...build, // <-- store the full build object!
                image_source:
                  build.components.cpu?.image_source ||
                  build.components.gpu?.image_source ||
                  build.components.motherboard?.image_source ||
                  build.components.case?.image_source ||
                  build.components.memory?.image_source ||
                  build.components.storage?.image_source ||
                  build.components.psu?.image_source ||
                  build.components.cooler?.image_source ||
                  null,
              })),
            },
          ];
          return updated;
        });
      } catch (err) {
        console.error("Error fetching builds:", err);
        setFolders((prev) => {
          const updated = { ...prev };
          updated[1][0].profileBuilds = [];
          return updated;
        });
      } finally {
        setLoadingBuilds(false);
      }
    };

    fetchCompletedBuilds();
  }, [user]);

  // Update folders for saved components
  useEffect(() => {
    if (!savedComponents || typeof savedComponents !== "object") {
      return;
    }
    setFolders((prev) => {
      const updatedFolders = { ...prev };
      let hasChanged = false;
      updatedFolders[3] = updatedFolders[3].map((folder) => {
        const folderKey = folder.name.toLowerCase();
        const componentsForFolder = savedComponents[folderKey];
        if (
          componentsForFolder &&
          JSON.stringify(componentsForFolder) !==
            JSON.stringify(folder.profileBuilds)
        ) {
          hasChanged = true;
          return { ...folder, profileBuilds: componentsForFolder };
        }
        return folder;
      });
      return hasChanged ? updatedFolders : prev;
    });
  }, [savedComponents]);

  const handleDeleteFolder = (folderIndex) => {
    setFolders((prev) => {
      const updatedFolders = {
        ...prev,
        [activeTab]: prev[activeTab].filter(
          (_, index) => index !== folderIndex
        ),
      };
      return updatedFolders;
    });
  };

  const handleSaveFolder = (folderName) => {
    if (!folderName.trim()) return;
    setFolders((prev) => ({
      ...prev,
      [activeTab]: [
        ...(prev[activeTab] ?? []),
        { name: folderName, profileBuilds: [] },
      ],
    }));
    setTimeout(() => setOpenPopUp(false), 0);
  };

  return (
    <div className="profile_main">
      <div className="profile_primary">
        <div className="profile_image">
          {imageUrl ? (
            <img src={imageUrl} size={100} alt="Profile" />
          ) : (
            <UserOutlined className="default-avatar-icon" />
          )}
        </div>
        <div className="profile_userDetails">
          <div className="profie_user_info">
            <p className="profile_username"> {userName} </p>
            <p className="profile_followerCount">
              180 <span style={{ color: "#7d7e80" }}>followers</span>
            </p>
          </div>
        </div>
        <div className="profile_userBio">{userBio ? <p>{userBio}</p> : ""}</div>
        <div className="profile_editbtn">
          <button onClick={() => setOpenEditProfilePopUp(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile_secondary">
        <Tabs
          centered
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              label: "Completed Builds",
              key: "1",
              children: (
                <TabContent
                  tabKey="1"
                  folders={folders}
                  setFolders={setFolders}
                  handleDeleteFolder={handleDeleteFolder}
                  setOpenPopUp={setOpenPopUp}
                  loading={loadingBuilds}
                />
              ),
            },
            {
              label: "Saved Builds",
              key: "2",
              children: (
                <TabContent
                  tabKey="2"
                  folders={folders}
                  setFolders={setFolders}
                  handleDeleteFolder={handleDeleteFolder}
                  setOpenPopUp={setOpenPopUp}
                />
              ),
            },
            {
              label: "Saved Components",
              key: "3",
              children: (
                <TabContent
                  tabKey="3"
                  folders={folders}
                  setFolders={setFolders}
                  handleDeleteFolder={handleDeleteFolder}
                  setOpenPopUp={setOpenPopUp}
                />
              ),
            },
          ]}
        />
      </div>

      {openPopUp && (
        <NewFolderPopUp
          setOpenPopUp={setOpenPopUp}
          handleSaveFolder={handleSaveFolder}
        />
      )}
      {openEditProfilePopUp && (
        <EditProfilePopUp
          setOpenEditProfilePopUp={setOpenEditProfilePopUp}
          setImageUrl={setImageUrl}
          imageUrl={imageUrl}
          setUserBio={setUserBio}
          userBio={userBio}
          setUserName={setUserName}
          userName={userName}
        />
      )}
    </div>
  );
}

export default Profile;
