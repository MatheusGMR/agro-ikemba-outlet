import { useUserApproval } from '@/hooks/useUserApproval';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UnclosableDialog, UnclosableDialogContent, UnclosableDialogTitle, UnclosableDialogDescription } from './unclosable-dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Clock, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ApprovalBlockingModal() {
  // No longer block the entire app - users can browse freely
  return null;
}