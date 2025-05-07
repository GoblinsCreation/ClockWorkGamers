import { AnimatedContainer } from "./animated-elements";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="py-8">
      <AnimatedContainer 
        className="space-y-4"
        animationVariant="fadeIn"
        delay={0.1}
      >
        <h1 className="text-4xl font-bold tracking-tight neon-text-orange">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-3xl">{description}</p>
        )}
        {children}
      </AnimatedContainer>
    </div>
  );
}