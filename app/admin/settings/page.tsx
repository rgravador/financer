'use client'

import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Switch } from '@heroui/switch'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-default-500 mt-1">Configure system-wide settings and preferences</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-semibold">General Settings</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Tenant Registration</p>
              <p className="text-sm text-default-500">Allow new tenants to register themselves</p>
            </div>
            <Switch defaultSelected={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-default-500">Send email notifications for important events</p>
            </div>
            <Switch defaultSelected={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-default-500">Put the system in maintenance mode</p>
            </div>
            <Switch defaultSelected={false} />
          </div>
        </CardBody>
      </Card>

      {/* Loan Settings */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-semibold">Loan Settings</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-approve Small Loans</p>
              <p className="text-sm text-default-500">Automatically approve loans under a certain amount</p>
            </div>
            <Switch defaultSelected={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require KYC for All Loans</p>
              <p className="text-sm text-default-500">Require complete KYC information before loan approval</p>
            </div>
            <Switch defaultSelected={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Late Payment Penalties</p>
              <p className="text-sm text-default-500">Automatically apply penalties for late payments</p>
            </div>
            <Switch defaultSelected={true} />
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button color="primary" size="lg">
          Save Settings
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-default-50">
        <CardBody>
          <p className="text-sm text-default-600">
            Note: This is a placeholder settings page. Settings will be persisted to the database once the backend implementation is complete.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
