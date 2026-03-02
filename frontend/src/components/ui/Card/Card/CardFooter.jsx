import { cn } from "../utils";
const CardFooter = ({
  className,
  children,
  ...props
}) => {
  return <div className={cn("pt-4 flex items-center", className)} {...props}>
      {children}
    </div>;
};
export {
  CardFooter
};
