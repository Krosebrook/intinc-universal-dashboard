import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Download, 
  Copy, 
  Settings, 
  Shield, 
  Rocket, 
  Code2, 
  Smartphone,
  Server,
  Terminal,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowConfig {
  // Basic Info
  repoOwner: string;
  repoName: string;
  mainBranch: string;
  devBranch: string;
  prodBranch: string;
  
  // Project Settings
  projectType: string;
  primaryLanguage: string;
  packageManager: string;
  installCmd: string;
  buildCmd: string;
  testCmd: string;
  lintCmd: string;
  typeCheckCmd: string;
  
  // Security
  prodRequireReviews: boolean;
  prodRequiredApprovals: number;
  prodRequireSignedCommits: boolean;
  prodRequireStatusChecks: boolean;
  prodRequiredChecks: string;
  mainRequireReviews: boolean;
  mainRequiredApprovals: number;
  mainRequireStatusChecks: boolean;
  mainRequiredChecks: string;
  devRequireStatusChecks: boolean;
  devRequiredChecks: string;
  enableDependabot: boolean;
  enableCodeQL: boolean;
  enableSecretScanning: boolean;
  requireCodeowners: boolean;
  
  // Deployment
  ciProvider: string;
  enableAutoDeploy: boolean;
  devDeployUrl: string;
  stagingDeployUrl: string;
  prodDeployUrl: string;
  deployPlatform: string;
  autoDeployDev: boolean;
  autoDeployStaging: boolean;
  prodManualApproval: boolean;
  
  // Additional
  slackWebhookUrl: string;
  notificationEmail: string;
  dockerRegistry: string;
  aiProvider: string;
  aiModel: string;
}

const defaultConfig: WorkflowConfig = {
  repoOwner: '',
  repoName: '',
  mainBranch: 'main',
  devBranch: 'development',
  prodBranch: 'production',
  projectType: 'nextjs-pwa',
  primaryLanguage: 'typescript',
  packageManager: 'npm',
  installCmd: 'npm install',
  buildCmd: 'npm run build',
  testCmd: 'npm test',
  lintCmd: 'npm run lint',
  typeCheckCmd: 'npm run lint:types',
  prodRequireReviews: true,
  prodRequiredApprovals: 2,
  prodRequireSignedCommits: true,
  prodRequireStatusChecks: true,
  prodRequiredChecks: 'test,build,security-scan,lint',
  mainRequireReviews: true,
  mainRequiredApprovals: 1,
  mainRequireStatusChecks: true,
  mainRequiredChecks: 'test,build,lint',
  devRequireStatusChecks: true,
  devRequiredChecks: 'test,lint',
  enableDependabot: true,
  enableCodeQL: true,
  enableSecretScanning: true,
  requireCodeowners: true,
  ciProvider: 'github-actions',
  enableAutoDeploy: true,
  devDeployUrl: 'https://dev.example.com',
  stagingDeployUrl: 'https://staging.example.com',
  prodDeployUrl: 'https://example.com',
  deployPlatform: 'vercel',
  autoDeployDev: true,
  autoDeployStaging: true,
  prodManualApproval: true,
  slackWebhookUrl: '',
  notificationEmail: '',
  dockerRegistry: 'ghcr',
  aiProvider: 'claude',
  aiModel: 'claude-3-sonnet',
};

export default function WorkflowGeneratorPage() {
  const [config, setConfig] = useState<WorkflowConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState('basic');

  const updateConfig = (field: keyof WorkflowConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: string) => {
    let presetConfig: Partial<WorkflowConfig> = {};
    
    switch (preset) {
      case 'nextjs-pwa':
        presetConfig = {
          projectType: 'nextjs-pwa',
          primaryLanguage: 'typescript',
          packageManager: 'npm',
          installCmd: 'npm install',
          buildCmd: 'npm run build',
          testCmd: 'npm test',
          lintCmd: 'npm run lint',
          typeCheckCmd: 'npm run lint:types',
          deployPlatform: 'vercel',
        };
        break;
      case 'react-native':
        presetConfig = {
          projectType: 'react-native',
          primaryLanguage: 'typescript',
          packageManager: 'npm',
          installCmd: 'npm install',
          buildCmd: 'npm run build',
          testCmd: 'npm test',
          lintCmd: 'npm run lint',
          typeCheckCmd: 'npm run tsc',
          deployPlatform: 'app-stores',
        };
        break;
      case 'python-api':
        presetConfig = {
          projectType: 'python-api',
          primaryLanguage: 'python',
          packageManager: 'poetry',
          installCmd: 'poetry install',
          buildCmd: 'poetry build',
          testCmd: 'poetry run pytest',
          lintCmd: 'poetry run black . && poetry run flake8 && poetry run mypy .',
          typeCheckCmd: 'poetry run mypy .',
          deployPlatform: 'docker',
        };
        break;
      case 'rust-cli':
        presetConfig = {
          projectType: 'rust-cli',
          primaryLanguage: 'rust',
          packageManager: 'cargo',
          installCmd: 'cargo fetch',
          buildCmd: 'cargo build --release',
          testCmd: 'cargo test',
          lintCmd: 'cargo clippy --all-targets --all-features -- -D warnings',
          typeCheckCmd: 'cargo check',
          deployPlatform: 'github-releases',
        };
        break;
    }
    
    setConfig(prev => ({ ...prev, ...presetConfig }));
    toast.success(`Applied ${preset} preset`);
  };

  const generateEnvContent = (): string => {
    return `# ============================================================================
# Git Workflow Automation - Generated Configuration
# ============================================================================
# Generated at: ${new Date().toISOString()}
# ============================================================================

# ----------------------------------------------------------------------------
# REPOSITORY INFORMATION
# ----------------------------------------------------------------------------
REPO_OWNER="${config.repoOwner}"
REPO_NAME="${config.repoName}"
MAIN_BRANCH="${config.mainBranch}"
DEV_BRANCH="${config.devBranch}"
PROD_BRANCH="${config.prodBranch}"

# ----------------------------------------------------------------------------
# PROJECT CONFIGURATION
# ----------------------------------------------------------------------------
PROJECT_TYPE="${config.projectType}"
PRIMARY_LANGUAGE="${config.primaryLanguage}"
PACKAGE_MANAGER="${config.packageManager}"

# ----------------------------------------------------------------------------
# BUILD & TEST COMMANDS
# ----------------------------------------------------------------------------
INSTALL_CMD="${config.installCmd}"
BUILD_CMD="${config.buildCmd}"
TEST_CMD="${config.testCmd}"
LINT_CMD="${config.lintCmd}"
TYPE_CHECK_CMD="${config.typeCheckCmd}"

# ----------------------------------------------------------------------------
# BRANCH PROTECTION SETTINGS
# ----------------------------------------------------------------------------
PROD_REQUIRE_REVIEWS=${config.prodRequireReviews}
PROD_REQUIRED_APPROVALS=${config.prodRequiredApprovals}
PROD_REQUIRE_SIGNED_COMMITS=${config.prodRequireSignedCommits}
PROD_REQUIRE_STATUS_CHECKS=${config.prodRequireStatusChecks}
PROD_REQUIRED_CHECKS="${config.prodRequiredChecks}"

MAIN_REQUIRE_REVIEWS=${config.mainRequireReviews}
MAIN_REQUIRED_APPROVALS=${config.mainRequiredApprovals}
MAIN_REQUIRE_STATUS_CHECKS=${config.mainRequireStatusChecks}
MAIN_REQUIRED_CHECKS="${config.mainRequiredChecks}"

DEV_REQUIRE_STATUS_CHECKS=${config.devRequireStatusChecks}
DEV_REQUIRED_CHECKS="${config.devRequiredChecks}"

# ----------------------------------------------------------------------------
# SECURITY SETTINGS
# ----------------------------------------------------------------------------
ENABLE_DEPENDABOT=${config.enableDependabot}
ENABLE_CODEQL=${config.enableCodeQL}
ENABLE_SECRET_SCANNING=${config.enableSecretScanning}
REQUIRE_CODEOWNERS=${config.requireCodeowners}
CODEOWNERS_PATH=".github/CODEOWNERS"

# ----------------------------------------------------------------------------
# CI/CD PROVIDER
# ----------------------------------------------------------------------------
CI_PROVIDER="${config.ciProvider}"
ENABLE_AUTO_DEPLOY=${config.enableAutoDeploy}

# ----------------------------------------------------------------------------
# DEPLOYMENT SETTINGS
# ----------------------------------------------------------------------------
DEV_DEPLOY_URL="${config.devDeployUrl}"
STAGING_DEPLOY_URL="${config.stagingDeployUrl}"
PROD_DEPLOY_URL="${config.prodDeployUrl}"
DEPLOY_PLATFORM="${config.deployPlatform}"
AUTO_DEPLOY_DEV=${config.autoDeployDev}
AUTO_DEPLOY_STAGING=${config.autoDeployStaging}
PROD_MANUAL_APPROVAL=${config.prodManualApproval}

# ----------------------------------------------------------------------------
# NOTIFICATION SETTINGS
# ----------------------------------------------------------------------------
SLACK_WEBHOOK_URL="${config.slackWebhookUrl}"
NOTIFICATION_EMAIL="${config.notificationEmail}"

# ----------------------------------------------------------------------------
# DOCKER SETTINGS
# ----------------------------------------------------------------------------
DOCKER_REGISTRY="${config.dockerRegistry}"
DOCKER_IMAGE_NAME="\${REPO_OWNER}/\${REPO_NAME}"

# ----------------------------------------------------------------------------
# ADDITIONAL SETTINGS
# ----------------------------------------------------------------------------
REQUIRE_LINEAR_HISTORY=false
ALLOW_SQUASH_MERGE=true
ALLOW_MERGE_COMMIT=true
ALLOW_REBASE_MERGE=true
DELETE_BRANCH_ON_MERGE=true

# ----------------------------------------------------------------------------
# AI REFACTORING SETTINGS
# ----------------------------------------------------------------------------
AI_PROVIDER="${config.aiProvider}"
AI_MODEL="${config.aiModel}"
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.2
`;
  };

  const downloadEnv = () => {
    const content = generateEnvContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refactor-config.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration file downloaded');
  };

  const copyToClipboard = () => {
    const content = generateEnvContent();
    navigator.clipboard.writeText(content);
    toast.success('Configuration copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Git Workflow Configuration Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate a complete Git workflow automation configuration for your project. 
            Choose a preset or customize every detail.
          </p>
        </div>

        {/* Preset Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
            <CardDescription>
              Start with a pre-configured template for your project type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col py-6 space-y-2"
                onClick={() => applyPreset('nextjs-pwa')}
              >
                <Code2 className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Next.js PWA</div>
                  <div className="text-xs text-muted-foreground">
                    React + TypeScript + Vercel
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto flex-col py-6 space-y-2"
                onClick={() => applyPreset('react-native')}
              >
                <Smartphone className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">React Native</div>
                  <div className="text-xs text-muted-foreground">
                    Mobile + iOS/Android
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto flex-col py-6 space-y-2"
                onClick={() => applyPreset('python-api')}
              >
                <Server className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Python API</div>
                  <div className="text-xs text-muted-foreground">
                    FastAPI + Poetry + Docker
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto flex-col py-6 space-y-2"
                onClick={() => applyPreset('rust-cli')}
              >
                <Terminal className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Rust CLI</div>
                  <div className="text-xs text-muted-foreground">
                    Cargo + Cross-compile
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Configuration Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">
                  <Info className="h-4 w-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="project">
                  <Settings className="h-4 w-4 mr-2" />
                  Project
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="deployment">
                  <Rocket className="h-4 w-4 mr-2" />
                  Deployment
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="repoOwner">Repository Owner</Label>
                    <Input
                      id="repoOwner"
                      placeholder="your-github-username"
                      value={config.repoOwner}
                      onChange={(e) => updateConfig('repoOwner', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="repoName">Repository Name</Label>
                    <Input
                      id="repoName"
                      placeholder="your-repository-name"
                      value={config.repoName}
                      onChange={(e) => updateConfig('repoName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainBranch">Main Branch</Label>
                    <Input
                      id="mainBranch"
                      placeholder="main"
                      value={config.mainBranch}
                      onChange={(e) => updateConfig('mainBranch', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="devBranch">Development Branch</Label>
                    <Input
                      id="devBranch"
                      placeholder="development"
                      value={config.devBranch}
                      onChange={(e) => updateConfig('devBranch', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prodBranch">Production Branch</Label>
                    <Input
                      id="prodBranch"
                      placeholder="production"
                      value={config.prodBranch}
                      onChange={(e) => updateConfig('prodBranch', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Project Settings Tab */}
              <TabsContent value="project" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type</Label>
                    <Input
                      id="projectType"
                      placeholder="nextjs-pwa"
                      value={config.projectType}
                      onChange={(e) => updateConfig('projectType', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryLanguage">Primary Language</Label>
                    <Input
                      id="primaryLanguage"
                      placeholder="typescript"
                      value={config.primaryLanguage}
                      onChange={(e) => updateConfig('primaryLanguage', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="packageManager">Package Manager</Label>
                    <Input
                      id="packageManager"
                      placeholder="npm"
                      value={config.packageManager}
                      onChange={(e) => updateConfig('packageManager', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="installCmd">Install Command</Label>
                    <Input
                      id="installCmd"
                      placeholder="npm install"
                      value={config.installCmd}
                      onChange={(e) => updateConfig('installCmd', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buildCmd">Build Command</Label>
                    <Input
                      id="buildCmd"
                      placeholder="npm run build"
                      value={config.buildCmd}
                      onChange={(e) => updateConfig('buildCmd', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="testCmd">Test Command</Label>
                    <Input
                      id="testCmd"
                      placeholder="npm test"
                      value={config.testCmd}
                      onChange={(e) => updateConfig('testCmd', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lintCmd">Lint Command</Label>
                    <Input
                      id="lintCmd"
                      placeholder="npm run lint"
                      value={config.lintCmd}
                      onChange={(e) => updateConfig('lintCmd', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="typeCheckCmd">Type Check Command</Label>
                    <Input
                      id="typeCheckCmd"
                      placeholder="npm run lint:types"
                      value={config.typeCheckCmd}
                      onChange={(e) => updateConfig('typeCheckCmd', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Production Branch Protection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prodRequireReviews"
                        checked={config.prodRequireReviews}
                        onCheckedChange={(checked) => updateConfig('prodRequireReviews', checked)}
                      />
                      <Label htmlFor="prodRequireReviews">Require Reviews</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prodRequiredApprovals">Required Approvals</Label>
                      <Input
                        id="prodRequiredApprovals"
                        type="number"
                        min="1"
                        max="6"
                        value={config.prodRequiredApprovals}
                        onChange={(e) => updateConfig('prodRequiredApprovals', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prodRequireSignedCommits"
                        checked={config.prodRequireSignedCommits}
                        onCheckedChange={(checked) => updateConfig('prodRequireSignedCommits', checked)}
                      />
                      <Label htmlFor="prodRequireSignedCommits">Require Signed Commits</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prodRequireStatusChecks"
                        checked={config.prodRequireStatusChecks}
                        onCheckedChange={(checked) => updateConfig('prodRequireStatusChecks', checked)}
                      />
                      <Label htmlFor="prodRequireStatusChecks">Require Status Checks</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prodRequiredChecks">Required Status Checks (comma-separated)</Label>
                    <Input
                      id="prodRequiredChecks"
                      placeholder="test,build,security-scan,lint"
                      value={config.prodRequiredChecks}
                      onChange={(e) => updateConfig('prodRequiredChecks', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Main Branch Protection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mainRequireReviews"
                        checked={config.mainRequireReviews}
                        onCheckedChange={(checked) => updateConfig('mainRequireReviews', checked)}
                      />
                      <Label htmlFor="mainRequireReviews">Require Reviews</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mainRequiredApprovals">Required Approvals</Label>
                      <Input
                        id="mainRequiredApprovals"
                        type="number"
                        min="1"
                        max="6"
                        value={config.mainRequiredApprovals}
                        onChange={(e) => updateConfig('mainRequiredApprovals', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mainRequiredChecks">Required Status Checks (comma-separated)</Label>
                    <Input
                      id="mainRequiredChecks"
                      placeholder="test,build,lint"
                      value={config.mainRequiredChecks}
                      onChange={(e) => updateConfig('mainRequiredChecks', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableDependabot"
                        checked={config.enableDependabot}
                        onCheckedChange={(checked) => updateConfig('enableDependabot', checked)}
                      />
                      <Label htmlFor="enableDependabot">Enable Dependabot</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableCodeQL"
                        checked={config.enableCodeQL}
                        onCheckedChange={(checked) => updateConfig('enableCodeQL', checked)}
                      />
                      <Label htmlFor="enableCodeQL">Enable CodeQL</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableSecretScanning"
                        checked={config.enableSecretScanning}
                        onCheckedChange={(checked) => updateConfig('enableSecretScanning', checked)}
                      />
                      <Label htmlFor="enableSecretScanning">Enable Secret Scanning</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requireCodeowners"
                        checked={config.requireCodeowners}
                        onCheckedChange={(checked) => updateConfig('requireCodeowners', checked)}
                      />
                      <Label htmlFor="requireCodeowners">Require CODEOWNERS</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Deployment Tab */}
              <TabsContent value="deployment" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciProvider">CI/CD Provider</Label>
                    <Input
                      id="ciProvider"
                      placeholder="github-actions"
                      value={config.ciProvider}
                      onChange={(e) => updateConfig('ciProvider', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deployPlatform">Deployment Platform</Label>
                    <Input
                      id="deployPlatform"
                      placeholder="vercel"
                      value={config.deployPlatform}
                      onChange={(e) => updateConfig('deployPlatform', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="devDeployUrl">Development URL</Label>
                    <Input
                      id="devDeployUrl"
                      placeholder="https://dev.example.com"
                      value={config.devDeployUrl}
                      onChange={(e) => updateConfig('devDeployUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stagingDeployUrl">Staging URL</Label>
                    <Input
                      id="stagingDeployUrl"
                      placeholder="https://staging.example.com"
                      value={config.stagingDeployUrl}
                      onChange={(e) => updateConfig('stagingDeployUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prodDeployUrl">Production URL</Label>
                    <Input
                      id="prodDeployUrl"
                      placeholder="https://example.com"
                      value={config.prodDeployUrl}
                      onChange={(e) => updateConfig('prodDeployUrl', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Auto-Deployment Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoDeployDev"
                        checked={config.autoDeployDev}
                        onCheckedChange={(checked) => updateConfig('autoDeployDev', checked)}
                      />
                      <Label htmlFor="autoDeployDev">Auto-deploy Development</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoDeployStaging"
                        checked={config.autoDeployStaging}
                        onCheckedChange={(checked) => updateConfig('autoDeployStaging', checked)}
                      />
                      <Label htmlFor="autoDeployStaging">Auto-deploy Staging</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prodManualApproval"
                        checked={config.prodManualApproval}
                        onCheckedChange={(checked) => updateConfig('prodManualApproval', checked)}
                      />
                      <Label htmlFor="prodManualApproval">Production Manual Approval</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <div className="space-y-2">
                    <Label htmlFor="slackWebhookUrl">Slack Webhook URL (optional)</Label>
                    <Input
                      id="slackWebhookUrl"
                      placeholder="https://hooks.slack.com/services/..."
                      value={config.slackWebhookUrl}
                      onChange={(e) => updateConfig('slackWebhookUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail">Notification Email (optional)</Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      placeholder="team@example.com"
                      value={config.notificationEmail}
                      onChange={(e) => updateConfig('notificationEmail', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Configuration Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Preview</CardTitle>
            <CardDescription>
              Preview your generated configuration file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-950 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-200">
                <code>{generateEnvContent()}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={downloadEnv} 
                className="flex-1"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download refactor-config.env
              </Button>
              
              <Button 
                onClick={copyToClipboard} 
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Copy className="mr-2 h-5 w-5" />
                Copy to Clipboard
              </Button>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Save this file as <code className="bg-muted px-1 py-0.5 rounded">refactor-config.env</code> in your 
              <code className="bg-muted px-1 py-0.5 rounded ml-1">workflow-templates/</code> directory
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
