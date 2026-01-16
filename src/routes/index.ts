```typescript
import express from 'express';
import { AuthRoutes } from '@/modules/auth/auth.routes';
import { ContentRoutes } from '@/modules/content/content.routes';
import { EventRoutes } from '@/modules/event// Auto-update status based on dates
eventSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = EventStatus.UPCOMING;
  } else if (now > this.endDate) {
    this.status = EventStatus.COMPLETED;
  } else {
    this.status = EventStatus.ONGOING;
  }
  next();
});

// Filter out deleted events
eventSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

eventSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
port default router;
```
