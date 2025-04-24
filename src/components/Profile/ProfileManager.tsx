
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const ProfileManager = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    position: currentUser?.position || '',
  });

  const handleSave = () => {
    // In a real app, this would update the user profile
    // For now, we'll just show a success message
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>
                {currentUser?.name?.split(' ').map(part => part[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
              <p className="text-muted-foreground">{currentUser?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-md p-2"
                    disabled
                  />
                </div>
                {currentUser?.role === 'employee' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full border rounded-md p-2"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Position</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full border rounded-md p-2"
                        disabled
                      />
                    </div>
                  </>
                )}
                <div className="flex space-x-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground">Name</label>
                    <p className="text-lg">{currentUser?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground">Email</label>
                    <p className="text-lg">{currentUser?.email}</p>
                  </div>
                  {currentUser?.role === 'employee' && (
                    <>
                      <div>
                        <label className="block text-sm text-muted-foreground">Department</label>
                        <p className="text-lg">{currentUser?.department}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground">Position</label>
                        <p className="text-lg">{currentUser?.position}</p>
                      </div>
                    </>
                  )}
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
