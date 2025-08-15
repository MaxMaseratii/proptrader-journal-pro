import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Share2, 
  Bookmark,
  Flag,
  Award,
  TrendingUp,
  Users,
  Crown,
  Star,
  Eye,
  Clock,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
    rank: 'Beginner' | 'Intermediate' | 'Expert' | 'Elite';
    reputation: number;
    isVerified: boolean;
  };
  category: 'Strategy' | 'Risk Management' | 'Psychology' | 'Prop Firms' | 'Tools' | 'General';
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies: number;
  views: number;
  createdAt: Date;
  isPinned: boolean;
  isHot: boolean;
  lastActivity: Date;
}

interface Reply {
  id: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
    rank: string;
    reputation: number;
  };
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  isAccepted?: boolean;
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best Risk Management Rules for TopStep Challenge',
    content: 'Looking for proven risk management strategies for TopStep challenges. What are your essential rules?',
    author: {
      username: 'PropTrader_Mike',
      rank: 'Expert',
      reputation: 2850,
      isVerified: true
    },
    category: 'Risk Management',
    tags: ['TopStep', 'Risk', 'Challenge'],
    upvotes: 45,
    downvotes: 2,
    replies: 23,
    views: 1250,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPinned: true,
    isHot: true,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: '2',
    title: 'My Journey from $10K to $100K Challenge - Strategy Breakdown',
    content: 'After 8 months of prop trading, here\'s my complete strategy that helped me scale from small to large accounts...',
    author: {
      username: 'FuturesKing',
      rank: 'Elite',
      reputation: 5420,
      isVerified: true
    },
    category: 'Strategy',
    tags: ['Success Story', 'Futures', 'Scaling'],
    upvotes: 128,
    downvotes: 5,
    replies: 67,
    views: 3450,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isPinned: false,
    isHot: true,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Psychology Tips: Overcoming Revenge Trading',
    content: 'Struggling with revenge trading after losses? Here are 5 techniques that completely changed my mindset...',
    author: {
      username: 'MindfulTrader',
      rank: 'Intermediate',
      reputation: 1280,
      isVerified: false
    },
    category: 'Psychology',
    tags: ['Psychology', 'Discipline', 'Mental Health'],
    upvotes: 89,
    downvotes: 1,
    replies: 34,
    views: 2100,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isPinned: false,
    isHot: false,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'FTMO vs Apex vs MyForexFunds - 2024 Comparison',
    content: 'Updated comparison of major prop firms including rules, payouts, and personal experiences...',
    author: {
      username: 'PropAnalyst',
      rank: 'Expert',
      reputation: 3650,
      isVerified: true
    },
    category: 'Prop Firms',
    tags: ['FTMO', 'Apex', 'MyForexFunds', 'Comparison'],
    upvotes: 156,
    downvotes: 8,
    replies: 89,
    views: 4890,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isPinned: false,
    isHot: true,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000)
  }
];

export default function CommunityForum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: ''
  });

  const categories = ['All', 'Strategy', 'Risk Management', 'Psychology', 'Prop Firms', 'Tools', 'General'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        return (b.upvotes - b.downvotes + b.replies) - (a.upvotes - a.downvotes + a.replies);
      case 'new':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'top':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      default:
        return 0;
    }
  });

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite': return 'text-purple-400';
      case 'Expert': return 'text-prop-gold';
      case 'Intermediate': return 'text-prop-tiffany';
      default: return 'text-gray-400';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Elite': return <Crown className="h-4 w-4" />;
      case 'Expert': return <Award className="h-4 w-4" />;
      case 'Intermediate': return <Star className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strategy': return 'bg-prop-gold/20 text-prop-gold border-prop-gold/30';
      case 'Risk Management': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'Psychology': return 'bg-prop-tiffany/20 text-prop-tiffany border-prop-tiffany/30';
      case 'Prop Firms': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Tools': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleVote = (postId: string, type: 'up' | 'down') => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            upvotes: type === 'up' ? post.upvotes + 1 : post.upvotes,
            downvotes: type === 'down' ? post.downvotes + 1 : post.downvotes
          }
        : post
    ));
  };

  const submitNewPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: {
        username: 'CurrentUser',
        rank: 'Intermediate',
        reputation: 850,
        isVerified: false
      },
      category: newPost.category as any,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      upvotes: 0,
      downvotes: 0,
      replies: 0,
      views: 0,
      createdAt: new Date(),
      isPinned: false,
      isHot: false,
      lastActivity: new Date()
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', category: 'General', tags: '' });
    setShowNewPost(false);
  };

  return (
    <div className="space-y-6">
      {/* Forum Header */}
      <Card className="bg-dark-card border-prop-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient-gold flex items-center">
              <Users className="mr-2 h-5 w-5" />
              PropJournal Community Forum
            </CardTitle>
            <Button 
              onClick={() => setShowNewPost(true)}
              className="bg-prop-gold hover:bg-prop-gold/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>2,450 posts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>1,280 members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>156 online</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-dark-card border-gray-600">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts, users, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border-gray-600 rounded px-3 py-2 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Tabs value={sortBy} onValueChange={(value: any) => setSortBy(value)} className="w-auto">
              <TabsList className="bg-gray-700 border-gray-600">
                <TabsTrigger value="hot" className="text-xs">Hot</TabsTrigger>
                <TabsTrigger value="new" className="text-xs">New</TabsTrigger>
                <TabsTrigger value="top" className="text-xs">Top</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* New Post Dialog */}
      {showNewPost && (
        <Card className="bg-dark-card border-prop-gold/30">
          <CardHeader>
            <CardTitle className="text-white">Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-700 border-gray-600"
              />
              <select 
                value={newPost.category}
                onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                className="bg-gray-700 border-gray-600 rounded px-3 py-2"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Textarea
              placeholder="Share your insights, ask questions, or start a discussion..."
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="bg-gray-700 border-gray-600 min-h-32"
            />
            <Input
              placeholder="Tags (comma separated)..."
              value={newPost.tags}
              onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
              className="bg-gray-700 border-gray-600"
            />
            <div className="flex space-x-2">
              <Button onClick={submitNewPost} className="bg-prop-green hover:bg-prop-green/80">
                Post
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Card key={post.id} className={`bg-dark-card transition-colors hover:border-prop-gold/30 ${
            post.isPinned ? 'border-prop-gold/50' : 'border-gray-600'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback className="bg-prop-gold text-black">
                    {post.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {post.isPinned && (
                      <Badge className="bg-prop-gold/20 text-prop-gold border-prop-gold/30">
                        Pinned
                      </Badge>
                    )}
                    {post.isHot && (
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                        Hot
                      </Badge>
                    )}
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 hover:text-prop-gold cursor-pointer">
                    {post.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs text-gray-400 border-gray-600">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-medium ${getRankColor(post.author.rank)}`}>
                          {post.author.username}
                        </span>
                        {post.author.isVerified && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            Verified
                          </Badge>
                        )}
                        <div className={`flex items-center space-x-1 ${getRankColor(post.author.rank)}`}>
                          {getRankIcon(post.author.rank)}
                          <span className="text-xs">{post.author.rank}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(post.createdAt)} ago
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 'up')}
                    className="h-8 w-8 p-0 hover:bg-green-500/20 hover:text-green-500"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-white">
                    {post.upvotes - post.downvotes}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 'down')}
                    className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-500"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}