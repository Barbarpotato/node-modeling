import { Box, Flex, Heading, Separator, useBreakpointValue } from '@chakra-ui/react';
import Data from '@/components/settings/Data';
import Model from '@/components/settings/Model';
import APIKEY from '@/components/settings/API';
import { useState } from 'react';

function Setting() {
    const [tabKey, setTabKey] = useState("Model");

    const tabInfo = [
        { key: "Model", component: <Model /> },
        { key: "Data", component: <Data /> },
        { key: "API", component: <APIKEY /> },
    ];

    // Responsive values using useBreakpointValue
    const paddingX = useBreakpointValue({ base: 4, md: 10, lg: 25 }); // Smaller padding on mobile
    const headingSize = useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' }); // Responsive heading size
    const tabHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' }); // Tab heading size
    const flexDirection = useBreakpointValue({ base: 'column', md: 'row' }); // Stack on mobile

    return (
        <Box paddingY={5} paddingX={paddingX}>
            <Box mt={5}>
                <Heading paddingX={paddingX} size={headingSize}>
                    Settings
                </Heading>
            </Box>

            <Separator my={{ base: 6, md: 10 }} /> {/* Responsive margin */}

            <Flex direction={flexDirection}>
                {/* Tabs */}
                <Flex
                    paddingX={paddingX}
                    direction="column"
                    width={{ base: '100%', md: 'auto' }} // Full width on mobile
                    mb={{ base: 4, md: 0 }} // Margin bottom on mobile
                >
                    {tabInfo.map((item) => (
                        <Heading
                            key={item.key}
                            size={tabHeadingSize}
                            onClick={() => setTabKey(item.key)}
                            _hover={{ opacity: 1 }}
                            opacity={tabKey === item.key ? 1 : 0.5}
                            my={2}
                            paddingX={50}
                            textAlign={{ base: 'center', md: 'left' }} // Center tabs on mobile
                            as="button"
                            cursor="pointer"
                        >
                            {item.key}
                        </Heading>
                    ))}
                </Flex>

                {/* Tab Content */}
                <Box
                    width={{ base: '100%', md: 'full' }} // Full width on mobile, grow on desktop
                    paddingX={paddingX}
                    my={2}
                >
                    {tabInfo.find((item) => item.key === tabKey).component}
                </Box>
            </Flex>
        </Box>
    );
}

export default Setting;