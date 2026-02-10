import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BaseCardProps {
  title?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  cardClassName?: string; 
  cardTitleClassName?: string; 
  headerClassName?: string; 
  contentClassName?: string; 
  footerClassName?: string; 
}

export const BaseCard = ({ 
  title, 
  description, 
  action, 
  content, 
  footer, 
  cardClassName,
  cardTitleClassName,
  headerClassName,
  contentClassName,
  footerClassName
}: BaseCardProps) => {
  return (
    <Card className={cn("overflow-hidden p-0 pt-4", cardClassName)}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", headerClassName)}>
        <div className="space-y-1">
          <CardTitle className={cn("", cardTitleClassName)}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      
      <CardContent className={cn("p-2", contentClassName)}>
        {content}
      </CardContent>
      
      {footer && (
        <CardFooter className={cn(" ", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}