import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';

export default function AppNavigationMenu() {
	return (
		<NavigationMenu>
			<NavigationMenuList className="mr-4 flex items-center gap-4">
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/">Home</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/summary">Summary</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<ThemeToggle />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
