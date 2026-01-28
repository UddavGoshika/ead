import React, { useState, useEffect } from "react";
import styles from "./AllPosts.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

type PostStatus = "Pending" | "Approved" | "Rejected";

type Post = {
    _id: string;
    title: string;
    authorName: string;
    category: string;
    content: string;
    image?: string;
    status: PostStatus;
    createdAt: string;
    // UI Mock Stats (since backend doesn't track these yet)
    views?: string;
    saves?: number;
    comments?: number;
    likes?: number;
    shares?: number;
};

const currentUser = "Admin";

const VerifiedPostsList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "my">("all");

    const [newPost, setNewPost] = useState({
        title: "",
        category: "Guide",
        content: "",
        image: null as File | null,
        imagePreview: "",
        status: "Draft" as "Draft" | "Pending Review",
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/blogs");
            const data = await response.json();
            if (data.success) {
                setPosts(data.blogs);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };



    const openFullPost = (post: Post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    const getDisplayStats = (post: Post) => {
        const isApproved = post.status === "Approved";
        // Mock stats for UI consistency as requested by user's theme
        return {
            likes: isApproved ? (post.likes || 124) : 0,
            comments: isApproved ? (post.comments || 12) : 0,
            saves: isApproved ? (post.saves || 45) : 0,
            shares: isApproved ? (post.shares || 8) : 0,
            views: isApproved ? (post.views || "1.2k") : "0"
        };
    };

    const handleSubmitPost = async (status: "Draft" | "Pending Review") => {
        if (!newPost.title || !newPost.content) {
            alert("Title and content required");
            return;
        }

        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("category", newPost.category);
        formData.append("content", newPost.content);
        formData.append("status", status);
        formData.append("authorName", currentUser);

        if (newPost.image) {
            formData.append("image", newPost.image);
        }

        try {
            const response = await fetch("/api/admin/blogs", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                alert(status === "Draft" ? "Draft saved" : "Sent for review");
                setIsNewPostModalOpen(false);
                setNewPost({
                    title: "",
                    category: "Guide",
                    content: "",
                    image: null,
                    imagePreview: "",
                    status: "Draft",
                });
                fetchPosts();
            } else {
                alert("Error: " + data.error);
            }
        } catch {
            alert("Failed to save post");
        }
    };

    const handleApprovePost = async (postId: string) => {
        try {
            const response = await fetch(`/api/admin/blogs/${postId}/approve`, { method: "POST" });
            const data = await response.json();
            if (data.success) {
                alert("Post approved");
                fetchPosts();
            }
        } catch (error) {
            alert("Failed to approve");
        }
    };

    const handleRejectPost = async (postId: string) => {
        const remarks = prompt("Rejection reason?");
        if (!remarks) return;

        try {
            const response = await fetch(`/api/admin/blogs/${postId}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remarks }),
            });
            const data = await response.json();
            if (data.success) {
                alert("Post rejected");
                fetchPosts();
            }
        } catch (error) {
            alert("Failed to reject");
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const response = await fetch(`/api/admin/blogs/${postId}`, { method: "DELETE" });
            const data = await response.json();
            if (data.success) {
                alert("Post deleted");
                fetchPosts();
            }
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Verified & Published Posts"
                onSearch={(q) => console.log("Searching posts", q)}
                placeholder="Search posts..."
            />

            {/* NEW POST MODAL MOVED TO TOP FOR VISIBILITY */}
            {isNewPostModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() =>
                        setIsNewPostModalOpen(false)
                    }
                >
                    <div
                        className={styles.formModalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles.closeModal}
                            onClick={() =>
                                setIsNewPostModalOpen(false)
                            }
                        >
                            ×
                        </button>

                        <h2>Create New Blog Post</h2>

                        <form
                            className={styles.newPostForm}
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <div className={styles.formGroup}>
                                <label>Post Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a catchy title..."
                                    value={newPost.title}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            category: e.target.value,
                                        })
                                    }
                                >
                                    <option value="Guide">Guide</option>
                                    <option value="Success Story">
                                        Success Story
                                    </option>
                                    <option value="Security">
                                        Security
                                    </option>
                                    <option value="Update">Update</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Featured Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0];
                                        if (!file) return;

                                        const reader =
                                            new FileReader();
                                        reader.onloadend = () => {
                                            setNewPost({
                                                ...newPost,
                                                image: file,
                                                imagePreview:
                                                    reader.result as string,
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />

                                {newPost.imagePreview && (
                                    <div
                                        className={
                                            styles.imagePreviewBox
                                        }
                                    >
                                        <img
                                            src={
                                                newPost.imagePreview
                                            }
                                            alt="Preview"
                                            className={
                                                styles.imagePreview
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Content</label>
                                <textarea
                                    className={styles.plainTextarea}
                                    placeholder="Write your blog content here..."
                                    rows={10}
                                    value={newPost.content}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            content: e.target.value,
                                        })
                                    }
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() =>
                                        setIsNewPostModalOpen(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className={styles.outlineBtn}
                                    onClick={() =>
                                        handleSubmitPost("Draft")
                                    }
                                >
                                    Save Draft
                                </button>

                                <button
                                    type="button"
                                    className={styles.submitBtn}
                                    onClick={() =>
                                        handleSubmitPost(
                                            "Pending Review"
                                        )
                                    }
                                >
                                    Submit for Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.headerActionsSecondary}>
                <button
                    className={`${styles.outlineBtn} ${filterType === "my" ? styles.activeFilter : ""}`}
                    onClick={() => setFilterType(filterType === "all" ? "my" : "all")}
                >
                    👤 {filterType === "my" ? "All Blogs" : "My Blogs"}
                </button>

                <button
                    className={styles.primaryBtn}
                    onClick={() => {
                        alert("Button clicked! Opening modal...");
                        setIsNewPostModalOpen(true);
                    }}
                >
                    📝 New Post
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div className={styles.loader}>Loading posts...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Title + ID</th>
                                    <th>Category</th>
                                    <th>Views</th>
                                    <th>Saves</th>
                                    <th>Comments</th>
                                    <th>Likes</th>
                                    <th>Shares</th>
                                    <th>Status</th>
                                    <th>Published</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {posts
                                    .filter((post) => filterType === "all" ? true : post.authorName === currentUser)
                                    .map((post) => {
                                        const stats = getDisplayStats(post);
                                        return (
                                            <tr key={post._id}>
                                                <td>
                                                    <div className={styles.titleCell} onClick={() => openFullPost(post)}>
                                                        {post.image ? (
                                                            <img src={post.image} className={styles.postThumb} alt="post" />
                                                        ) : (
                                                            <div className={styles.icon}>📄</div>
                                                        )}
                                                        <div>
                                                            <strong className={styles.clickableTitle}>{post.title}</strong>
                                                            <small>ID: {post._id.slice(-6)}</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className={`${styles.badge} ${styles.category}`}>
                                                        {post.category}
                                                    </span>
                                                </td>

                                                <td>{stats.views}</td>
                                                <td>{stats.saves.toLocaleString()}</td>
                                                <td>{stats.comments.toLocaleString()}</td>
                                                <td>{stats.likes.toLocaleString()}</td>
                                                <td>{stats.shares.toLocaleString()}</td>

                                                <td>
                                                    <span className={`${styles.badge} ${styles[post.status.toLowerCase()]}`}>
                                                        {post.status}
                                                    </span>
                                                </td>

                                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>

                                                <td className={styles.actions}>
                                                    <button
                                                        className={styles.menuBtn}
                                                        onClick={() => setOpenMenu(openMenu === post._id ? null : post._id)}
                                                    >
                                                        ⋮
                                                    </button>

                                                    {openMenu === post._id && (
                                                        <div className={styles.actionMenu}>
                                                            <button onClick={() => openFullPost(post)}>View Full</button>
                                                            {post.status !== "Approved" && (
                                                                <button onClick={() => handleApprovePost(post._id)}>Approve</button>
                                                            )}
                                                            {post.status !== "Rejected" && (
                                                                <button onClick={() => handleRejectPost(post._id)}>Reject</button>
                                                            )}
                                                            <button className={styles.danger} onClick={() => handleDeletePost(post._id)}>Delete</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* FULL POST MODAL */}
            {selectedPost && (
                <div
                    className={styles.modalOverlay}
                    onClick={closeModal}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles.closeModal}
                            onClick={closeModal}
                        >
                            ×
                        </button>

                        <h2>{selectedPost.title}</h2>

                        <div className={styles.modalMeta}>
                            <span>ID: {selectedPost._id}</span>
                            <span>Author: {selectedPost.authorName}</span>
                            <span>Category: {selectedPost.category}</span>
                            <span>Published: {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                        </div>

                        {selectedPost.image && (
                            <img src={selectedPost.image} className={styles.modalImage} alt="post" />
                        )}

                        <div className={styles.modalBody} dangerouslySetInnerHTML={{ __html: selectedPost.content }} />

                        <div className={styles.modalActions}>
                            <button className={styles.editBtn} onClick={() => alert("Edit mode: You can currently delete and re-create this post or use the inline status actions.")}>
                                Edit Content
                            </button>
                            {selectedPost.status !== "Approved" && (
                                <button className={styles.approveBtn} onClick={() => { handleApprovePost(selectedPost._id); closeModal(); }}>
                                    Approve Post
                                </button>
                            )}
                            {selectedPost.status !== "Rejected" && (
                                <button className={styles.rejectBtn} onClick={() => { handleRejectPost(selectedPost._id); closeModal(); }}>
                                    Reject Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default VerifiedPostsList;
