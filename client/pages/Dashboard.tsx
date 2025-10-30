import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Edit2,
  LogOut,
  Loader2,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSkeleton, SkeletonCard } from '@/components/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ValidatedInput } from '@/components/ValidatedInput';
import { fetchWithMock } from '@/lib/api-mock';

interface UserStats {
  totalAttempts: number;
  avgScore: number;
  bestScore: number;
  topicsPracticed: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joined: string;
  bio?: string;
  stats: UserStats;
}

interface Attempt {
  id: string;
  quizTitle: string;
  score: number;
  total: number;
  accuracy: number;
  timeTaken: number;
  date: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', bio: '' });
  const [editErrors, setEditErrors] = useState<{ name?: string; bio?: string }>({});
  const [isEditing, setIsEditing] = useState(false);

  // Check authentication and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('qm_token') || sessionStorage.getItem('qm_token');
    if (!token) {
      toast.error('Please login to view your dashboard');
      navigate('/auth');
      return;
    }

    fetchUserData(token);
  }, [navigate]);

  const fetchUserData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data with token
      const response = await fetchWithMock('/api/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('qm_token');
        sessionStorage.removeItem('qm_token');
        toast.error('Session expired. Please login again');
        navigate('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
      setEditFormData({ name: userData.name, bio: userData.bio || '' });

      // Fetch attempts if user has attempts
      if (userData.stats.totalAttempts > 0) {
        const attemptsResponse = await fetchWithMock(
          `/api/users/${userData.id}/attempts?limit=5`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (attemptsResponse.ok) {
          const attemptsData = await attemptsResponse.json();
          setAttempts(attemptsData);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (editErrors[name as keyof typeof editErrors]) {
      setEditErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateEditForm = (): boolean => {
    const newErrors: typeof editErrors = {};
    if (!editFormData.name || editFormData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (editFormData.bio && editFormData.bio.length > 150) {
      newErrors.bio = 'Bio must be under 150 characters';
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) return;

    setIsEditing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: editFormData.name,
              bio: editFormData.bio,
            }
          : null
      );

      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    sessionStorage.removeItem('qm_token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleRetry = () => {
    const token = localStorage.getItem('qm_token') || sessionStorage.getItem('qm_token');
    if (token) {
      fetchUserData(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <SkeletonCard count={3} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <RotateCcw className="h-12 w-12 text-primary mx-auto" />
          <p className="text-foreground/60">Failed to load user data</p>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-between"
              role="alert"
              aria-live="polite"
            >
              <span className="text-destructive">{error}</span>
              <Button size="sm" onClick={handleRetry} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="text-6xl">{user.avatar || '👤'}</div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-foreground">{user.name}</h3>
                    <p className="text-xs text-foreground/60">{user.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-border pt-4 space-y-2 text-sm text-center">
                  <p className="text-foreground/60">
                    Joined {new Date(user.joined).toLocaleDateString()}
                  </p>
                  {user.bio && (
                    <p className="text-foreground/70 italic">{user.bio}</p>
                  )}
                </div>

                {/* Edit Button */}
                <Button
                  onClick={() => {
                    if (editMode) {
                      handleSaveProfile();
                    } else {
                      setEditMode(true);
                    }
                  }}
                  disabled={isEditing}
                  className="w-full gap-2"
                  variant={editMode ? 'default' : 'outline'}
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editMode ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              {/* Edit Form */}
              <AnimatePresence>
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3"
                  >
                    <ValidatedInput
                      label="Name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      error={editErrors.name}
                      required
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <textarea
                        name="bio"
                        value={editFormData.bio}
                        onChange={handleEditChange}
                        placeholder="Tell us about yourself..."
                        maxLength={150}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground/60">
                        {editFormData.bio.length} / 150
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setEditMode(false)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right: Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              {user.stats.totalAttempts === 0 ? (
                // Empty State
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 rounded-2xl border border-border/50 border-dashed bg-gradient-to-br from-primary/5 to-accent/5 text-center space-y-6"
                >
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <BookOpen className="h-16 w-16 text-primary/60" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">No progress yet</h3>
                    <p className="text-foreground/60 max-w-sm mx-auto">
                      You haven't attempted any quizzes. Start a quiz to see your progress here.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/quizzes')}
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Take a Quiz
                    </Button>
                    <p className="text-sm text-foreground/50">
                      💡 Try timed mode, practice topic-wise
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Filled State with Tabs
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attempts">Attempts</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground/60">Total Attempts</p>
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {user.stats.totalAttempts}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground/60">Average Score</p>
                          <TrendingUp className="h-5 w-5 text-accent" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {user.stats.avgScore}%
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground/60">Best Score</p>
                          <Award className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {user.stats.bestScore}%
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground/60">Topics Practiced</p>
                          <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {user.stats.topicsPracticed}
                        </p>
                      </motion.div>
                    </div>

                    {/* Recent Attempts */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-foreground">Recent Attempts</h3>
                      {attempts.length > 0 ? (
                        <div className="space-y-3">
                          {attempts.slice(0, 5).map((attempt, idx) => (
                            <motion.div
                              key={attempt.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-4 rounded-lg border border-border bg-card/50 flex items-center justify-between hover:bg-card/80 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {attempt.quizTitle}
                                </p>
                                <p className="text-sm text-foreground/60">
                                  {new Date(attempt.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-foreground">
                                  {attempt.score}/{attempt.total}
                                </p>
                                <p className="text-xs text-foreground/60">
                                  {attempt.accuracy}% accuracy
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </TabsContent>

                  {/* Attempts Tab */}
                  <TabsContent value="attempts" className="space-y-4">
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-border bg-secondary/30">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold">Quiz</th>
                              <th className="px-4 py-3 text-left font-semibold">Score</th>
                              <th className="px-4 py-3 text-left font-semibold">Accuracy</th>
                              <th className="px-4 py-3 text-left font-semibold">Time</th>
                              <th className="px-4 py-3 text-left font-semibold">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attempts.map((attempt) => (
                              <tr
                                key={attempt.id}
                                className="border-b border-border hover:bg-secondary/10 transition-colors"
                              >
                                <td className="px-4 py-3">{attempt.quizTitle}</td>
                                <td className="px-4 py-3">
                                  <span className="font-medium">
                                    {attempt.score}/{attempt.total}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full ${
                                        attempt.accuracy >= 80
                                          ? 'bg-green-500'
                                          : attempt.accuracy >= 60
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                      }`}
                                    />
                                    {attempt.accuracy}%
                                  </span>
                                </td>
                                <td className="px-4 py-3">{attempt.timeTaken}m</td>
                                <td className="px-4 py-3 text-foreground/60">
                                  {new Date(attempt.date).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Leaderboard Tab */}
                  <TabsContent value="leaderboard" className="space-y-4">
                    <div className="p-8 rounded-lg border border-border/50 border-dashed text-center">
                      <p className="text-foreground/60">Leaderboard coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
