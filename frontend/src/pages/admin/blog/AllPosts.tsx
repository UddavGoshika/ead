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
    views?: number;
    saves?: string[];
    comments?: any[];
    likes?: string[];
    shares?: number;
    reported?: number;
};

const currentUser = "e-Advocate Services";

const VerifiedPostsList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortBy, setSortBy] = useState<string>("Newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [myBlogsOnly, setMyBlogsOnly] = useState(false);

    const [newPost, setNewPost] = useState({
        _id: "",
        title: "",
        category: "Guide",
        content: "",
        image: null as File | string | null,
        imagePreview: "",
        status: "Pending" as PostStatus,
    });

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, sortBy, searchQuery, myBlogsOnly]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: statusFilter,
                sort: sortBy,
                search: searchQuery,
                onlyAdmin: myBlogsOnly.toString()
            });
            const response = await fetch(`/api/admin/blogs?${params.toString()}`);
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

    const handleEdit = (post: Post) => {
        setNewPost({
            _id: post._id,
            title: post.title,
            category: post.category,
            content: post.content,
            image: post.image || null,
            imagePreview: post.image || "",
            status: post.status,
        });
        setIsEditing(true);
        setIsNewPostModalOpen(true);
        setOpenMenu(null);
    };

    const handleSubmitPost = async () => {
        if (!newPost.title || !newPost.content) {
            alert("Title and content required");
            return;
        }

        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("category", newPost.category);
        formData.append("content", newPost.content);
        formData.append("status", "Approved"); // Admin creations/edits are auto-approved
        formData.append("authorName", currentUser);

        if (newPost.image instanceof File) {
            formData.append("image", newPost.image);
        } else if (typeof newPost.image === 'string') {
            formData.append("imageURL", newPost.image); // Send existing URL if no new file
        }

        try {
            const url = isEditing ? `/api/admin/blogs/${newPost._id}` : "/api/admin/blogs";
            const method = isEditing ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                alert(isEditing ? "Post updated" : "Post created");
                setIsNewPostModalOpen(false);
                setIsEditing(false);
                setNewPost({
                    _id: "",
                    title: "",
                    category: "Guide",
                    content: "",
                    image: null,
                    imagePreview: "",
                    status: "Pending",
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
                title="Blog Post Management"
                onSearch={(q) => setSearchQuery(q)}
                placeholder="Search by title, author, or content..."
            />

            <div className={styles.headerActionsSecondary}>
                <div className={styles.filterGroup}>
                    {["All", "Approved", "Pending", "Rejected"].map((status) => (
                        <button
                            key={status}
                            className={`${styles.outlineBtn} ${statusFilter === status ? styles.activeFilter : ""}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}

                    <button
                        className={`${styles.outlineBtn} ${myBlogsOnly ? styles.activeFilter : ""}`}
                        onClick={() => setMyBlogsOnly(!myBlogsOnly)}
                        style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: '10px', paddingLeft: '15px' }}
                    >
                        👤 My Blogs
                    </button>
                </div>

                <div className={styles.sortGroup} style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.plainSelect}
                        style={{ padding: '8px', borderRadius: '8px', background: '#1e293b', color: 'white', border: '1px solid #334155' }}
                    >
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="Views">Most Viewed</option>
                    </select>
                </div>

                <button
                    className={styles.primaryBtn}
                    onClick={() => {
                        setIsEditing(false);
                        setNewPost({
                            _id: "",
                            title: "",
                            category: "Guide",
                            content: "",
                            image: null,
                            imagePreview: "",
                            status: "Pending",
                        });
                        setIsNewPostModalOpen(true);
                    }}
                >
                    📝 New Post
                </button>
            </div>

            {/* NEW POST MODAL */}
            {isNewPostModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsNewPostModalOpen(false)}>
                    <div className={styles.formModalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeModal} onClick={() => setIsNewPostModalOpen(false)}>×</button>

                        <h2>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</h2>

                        <form className={styles.newPostForm} onSubmit={(e) => e.preventDefault()}>
                            <div className={styles.formGroup}>
                                <label>Post Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a catchy title..."
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                >
                                    <option value="Guide">Guide</option>
                                    <option value="Success Story">Success Story</option>
                                    <option value="Security">Security</option>
                                    <option value="Update">Update</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Featured Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setNewPost({
                                            ...newPost,
                                            image: file,
                                            imagePreview: URL.createObjectURL(file)
                                        });
                                    }}
                                />
                                {newPost.imagePreview && (
                                    <div className={styles.imagePreviewBox}>
                                        <img src={newPost.imagePreview} alt="Preview" className={styles.imagePreview} />
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
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsNewPostModalOpen(false)}>Cancel</button>
                                <button type="button" className={styles.submitBtn} onClick={handleSubmitPost}>
                                    {isEditing ? "Update Post" : "Publish Post"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                    <th>Likes</th>
                                    <th>Shares</th>
                                    <th>Saves</th>
                                    <th>Reported</th>
                                    <th>Author</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post._id}>
                                        <td>
                                            <div className={styles.titleCell} onClick={() => setSelectedPost(post)}>
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

                                        <td>{post.views || 0}</td>
                                        <td>{post.likes?.length || 0}</td>
                                        <td>{post.shares || 0}</td>
                                        <td>{post.saves?.length || 0}</td>
                                        <td style={{ color: (post.reported || 0) > 0 ? '#f87171' : 'inherit' }}>
                                            {post.reported || 0}
                                        </td>
                                        <td>{post.authorName}</td>

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
                                                    <button onClick={() => setSelectedPost(post)}>View</button>
                                                    <button onClick={() => handleEdit(post)}>Edit</button>
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
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* FULL POST VIEW MODAL */}
            {selectedPost && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeModal} onClick={() => setSelectedPost(null)}>×</button>

                        <h2>{selectedPost.title}</h2>

                        <div className={styles.modalMeta}>
                            <span>ID: {selectedPost._id}</span>
                            <span>Author: {selectedPost.authorName}</span>
                            <span>Category: {selectedPost.category}</span>
                            <span>Date: {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                        </div>

                        {selectedPost.image && (
                            <img src={selectedPost.image} className={styles.modalImage} alt="post" />
                        )}

                        <div className={styles.modalBody} style={{ whiteSpace: 'pre-wrap' }}>
                            {selectedPost.content}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.editBtn} onClick={() => { handleEdit(selectedPost); setSelectedPost(null); }}>
                                Edit Content
                            </button>
                            {selectedPost.status !== "Approved" && (
                                <button className={styles.approveBtn} onClick={() => { handleApprovePost(selectedPost._id); setSelectedPost(null); }}>
                                    Approve
                                </button>
                            )}
                            {selectedPost.status !== "Rejected" && (
                                <button className={styles.rejectBtn} onClick={() => { handleRejectPost(selectedPost._id); setSelectedPost(null); }}>
                                    Reject
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
