import { Head } from '@inertiajs/react';
import { HelpCircle, Book, MessageCircle, Mail, ExternalLink, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Help', href: '/help' },
];

export default function Help() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & Support" />

            <div className="flex flex-col h-full bg-background overflow-y-auto">
                <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary shadow-lg shadow-primary/20 text-white">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                            <p className="text-muted-foreground">Find answers and get assistance</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
                            <CardHeader>
                                <Book className="w-8 h-8 text-primary mb-2" />
                                <CardTitle className="text-lg">Documentation</CardTitle>
                                <CardDescription>
                                    Learn how to use all features
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
                            <CardHeader>
                                <MessageCircle className="w-8 h-8 text-primary mb-2" />
                                <CardTitle className="text-lg">Community</CardTitle>
                                <CardDescription>
                                    Connect with other users
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <a href="mailto:support@taskflow.app" className="block">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 h-full">
                                <CardHeader>
                                    <Mail className="w-8 h-8 text-primary mb-2" />
                                    <CardTitle className="text-lg">Contact Support</CardTitle>
                                    <CardDescription>
                                        Get help from our team
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </a>
                    </div>

                    {/* FAQ Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">How do I create a new space?</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Navigate to the sidebar and click the "+" button next to "Spaces". Fill in the space name, description, and choose a color. Click "Create Space" to finish.
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">How do I invite members to a space?</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Go to Space Settings (gear icon) → Members tab → Click "Invite Member". Search for users by name or email and select their role.
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">How do I customize task statuses?</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Navigate to Space Settings → Statuses tab. Here you can add, edit, reorder, and delete custom statuses for your workflow.
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">How do I use drag and drop?</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                In both List and Board views, you can drag tasks between status groups to update their status. Hover over a task row to see the drag handle (grip icon).
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">How do I view task history?</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Click on any task to open the task modal, then navigate to the "Activity" tab to see a complete history of all changes made to that task.
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Section */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Still need help?</CardTitle>
                            <CardDescription>
                                Our support team is here to assist you
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                                <a href="mailto:support@taskflow.app" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    support@taskflow.app
                                </a>
                                <a href="tel:+18005550199" className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    +1 (800) 555-0199
                                </a>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="default" asChild>
                                    <a href="mailto:support@taskflow.app">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact Support
                                    </a>
                                </Button>
                                <Button variant="outline">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Full Docs
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </AppLayout>
    );
}
