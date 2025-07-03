import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EyeIcon,
  CloudArrowUpIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { knowledgeBaseService, KnowledgeArticle, KnowledgeCategory, CreateArticleData, UpdateArticleData } from '../../services/knowledgeBase';
import { LoadingSpinner } from '../../components/ui';
import toast from 'react-hot-toast';

const ArticleEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // State
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [] as string[],
    searchKeywords: '',
    attachments: [] as File[]
  });

  const [newTag, setNewTag] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadArticle(parseInt(id));
    }
  }, [id, isEditing]);

  const loadCategories = async () => {
    try {
      const categoriesData = await knowledgeBaseService.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true);
      const articleData = await knowledgeBaseService.getArticleById(articleId);
      setArticle(articleData);
      setFormData({
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt || '',
        categoryId: articleData.categoryId?.toString() || '',
        tags: articleData.tags || [],
        searchKeywords: articleData.searchKeywords || '',
        attachments: []
      });
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Failed to load article');
      navigate('/knowledge-base/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      if (publish) {
        setPublishing(true);
      } else {
        setSaving(true);
      }

      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        tags: formData.tags,
        searchKeywords: formData.searchKeywords.trim() || undefined,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined
      };

      let savedArticle: KnowledgeArticle;

      if (isEditing && id) {
        // Update existing article
        savedArticle = await knowledgeBaseService.updateArticle(parseInt(id), articleData as UpdateArticleData);
      } else {
        // Create new article
        savedArticle = await knowledgeBaseService.createArticle(articleData as CreateArticleData);
      }

      // Publish if requested
      if (publish && savedArticle.status !== 'published') {
        savedArticle = await knowledgeBaseService.publishArticle(savedArticle.id);
      }

      toast.success(
        isEditing
          ? publish
            ? 'Article updated and published successfully'
            : 'Article updated successfully'
          : publish
          ? 'Article created and published successfully'
          : 'Article created successfully'
      );

      navigate('/knowledge-base/admin');
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'Failed to save article');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h1>{formData.title || 'Untitled Article'}</h1>
        {formData.excerpt && (
          <p className="text-lg text-gray-600 dark:text-gray-400 italic">
            {formData.excerpt}
          </p>
        )}
        <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/knowledge-base/admin')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Article' : 'Create New Article'}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreview(!preview)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {preview ? 'Edit' : 'Preview'}
              </button>

              <button
                onClick={() => handleSubmit(false)}
                disabled={saving || publishing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {saving ? (
                  <LoadingSpinner size="xs" className="mr-2" />
                ) : (
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </button>

              <button
                onClick={() => handleSubmit(true)}
                disabled={saving || publishing}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <LoadingSpinner size="xs" className="mr-2" />
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                )}
                {isEditing && article?.status === 'published' ? 'Update & Publish' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              {preview ? (
                renderPreview()
              ) : (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter article title..."
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Excerpt
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      rows={2}
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Brief description of the article..."
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={20}
                      value={formData.content}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                      placeholder="Write your article content here... (Supports Markdown)"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You can use Markdown formatting. Supports headings, lists, links, and more.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FolderIcon className="h-5 w-5 mr-2" />
                Category
              </h3>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Tags
              </h3>
              
              <div className="space-y-3">
                {/* Add new tag */}
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Add tag..."
                  />
                  <button
                    onClick={addTag}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Add
                  </button>
                </div>

                {/* Current tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Keywords */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Search Keywords
              </h3>
              <textarea
                name="searchKeywords"
                rows={3}
                value={formData.searchKeywords}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Additional keywords for search..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Keywords to help users find this article.
              </p>
            </div>

            {/* File Attachments */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Attachments
              </h3>
              
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
              />
              
              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorPage;