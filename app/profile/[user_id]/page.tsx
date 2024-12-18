"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";


type Profile = {
  username: string;
  password: string;
  email: string;
  phonenumber: string;
  profilePicture: string;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const resolvedParams = use(params);
  const user_id = resolvedParams.user_id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [user_id]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profile?id=${user_id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("An error occurred while fetching the profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile({ ...editedProfile!, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'sourav0299'); 

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setEditedProfile({ ...editedProfile!, profilePicture: data.secure_url });
        } else {
          setMessage('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setMessage('An error occurred while uploading the image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`/api/profile?id=${user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || "Profile updated successfully");
        setProfile(editedProfile);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred while updating the profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Profile not found
      </div>
    );
  }

return (
  <div className="min-h-screen text-black bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
      {message && (
        <p
          className={`mb-4 text-center ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={editedProfile!.username}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={editedProfile!.password}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedProfile!.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="phonenumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phonenumber"
              name="phonenumber"
              value={editedProfile!.phonenumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="profilePicture"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Picture
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mt-1 block w-full"
              accept="image/*"
            />
            {editedProfile!.profilePicture && (
              <img
                src={editedProfile!.profilePicture}
                alt="Profile Preview"
                className="mt-2 rounded-full w-20 h-20 object-cover"
              />
            )}
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-4 flex justify-center">
            <img
              src={profile!.profilePicture}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <p>
            <strong>Username:</strong> {profile!.username}
          </p>
          <p>
            <strong>Email:</strong> {profile!.email}
          </p>
          <p>
            <strong>Phone Number:</strong> {profile!.phonenumber}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  </div>
);
}


